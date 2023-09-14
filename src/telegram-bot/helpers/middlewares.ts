import { InternalServerErrorException } from "@nestjs/common";
import { User } from "@prisma/client";
import { Context } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { MaybeArray, MaybePromise } from "~/common/types";
import { UserService } from "~/user/user.service";
import {
    ActionResult,
    BeforeHandleInputActions,
    BeforeHandleInputMiddleware,
    Middleware,
} from "../types/scenes";

export async function runMiddlewares<TState>(
    context: Context,
    middlewares: Middleware<TState>[],
    state: TState,
): Promise<boolean> {
    let allMiddlewaresAreExecuted = false;

    const dispatch = async (index: number): Promise<void> => {
        if (index === middlewares.length) {
            allMiddlewaresAreExecuted = true;
            return;
        }

        const currentMiddleware = middlewares[index];

        if (!currentMiddleware) {
            throw new InternalServerErrorException(
                `Middleware with index "${index}" is not found`,
            );
        }

        await currentMiddleware(context, () => dispatch(index + 1), state);
    };

    await dispatch(0);

    return allMiddlewaresAreExecuted;
}

export async function runBeforeHandleInputMiddlewares<TState>(
    context: Context,
    middlewares: BeforeHandleInputMiddleware<TState>[],
    state: TState,
): Promise<ActionResult<BeforeHandleInputActions> | undefined> {
    let actionResult: ActionResult<BeforeHandleInputActions> | undefined;
    let allMiddlewaresAreExecuted = false;

    const actions: Pick<BeforeHandleInputActions, "exit"> = {
        exit: () => {
            actionResult = { type: "exit" };
        },
    };

    const dispatch = async (index: number): Promise<void> => {
        if (index === middlewares.length) {
            allMiddlewaresAreExecuted = true;
            return;
        }

        const currentMiddleware = middlewares[index];

        if (!currentMiddleware) {
            throw new InternalServerErrorException(
                `Middleware with index "${index}" is not found`,
            );
        }

        await currentMiddleware(
            context,
            {
                ...actions,
                next: () => {
                    actionResult = { type: "next" };
                    return dispatch(index + 1);
                },
            },
            state,
        );
    };

    await dispatch(0);

    if (actionResult?.type === "next" && !allMiddlewaresAreExecuted) {
        return;
    }

    return actionResult;
}

export function useIf(
    maybeFilters: MaybeArray<(update: Context["update"]) => boolean>,
): (context: Context) => boolean {
    return (context) => {
        const predicate = mergeFilters(
            Array.isArray(maybeFilters) ? maybeFilters : [maybeFilters],
        );

        return predicate(context.update);
    };
}

export function exitOn(
    maybeFilters: MaybeArray<(update: Context["update"]) => boolean>,
): (context: Context, actions: BeforeHandleInputActions) => MaybePromise<void> {
    const filters = Array.isArray(maybeFilters) ? maybeFilters : [maybeFilters];

    const predicate = mergeFilters(filters);

    return (context, actions) => {
        if (predicate(context.update)) {
            return actions.exit();
        }

        return actions.next();
    };
}

export function nextOn(
    maybeFilters: MaybeArray<(update: Context["update"]) => boolean>,
): (context: Context, actions: BeforeHandleInputActions) => MaybePromise<void> {
    const filters = Array.isArray(maybeFilters) ? maybeFilters : [maybeFilters];

    const predicate = mergeFilters(filters);

    return (context, actions) => {
        if (predicate(context.update)) {
            return actions.next();
        }
    };
}

function mergeFilters(
    filters: ((update: Context["update"]) => boolean)[],
): (update: Update) => boolean {
    return (update: Update): boolean => {
        for (const filter of filters) {
            if (
                typeof filter === "string"
                    ? filter in update ||
                      ("message" in update && filter in update.message)
                    : filter(update)
            ) {
                return true;
            }
        }

        return false;
    };
}

export function replyOn(
    maybeFilters: MaybeArray<(update: Context["update"]) => boolean>,
    maybeTexts: MaybeArray<string | ((user: User) => MaybePromise<string>)>,
): (context: Context, next: () => MaybePromise<void>) => MaybePromise<void> {
    const predicate = mergeFilters(
        Array.isArray(maybeFilters) ? maybeFilters : [maybeFilters],
    );

    return async (context, next) => {
        return predicate(context.update)
            ? reply(maybeTexts)(context, next)
            : next();
    };
}

export function reply(
    maybeTexts: MaybeArray<string | ((user: User) => MaybePromise<string>)>,
): (context: Context, next: () => MaybePromise<void>) => MaybePromise<void> {
    return async (context, next) => {
        const texts = Array.isArray(maybeTexts) ? maybeTexts : [maybeTexts];
        const user = UserService.getCurrent();

        for (const text of texts) {
            await context.reply(
                typeof text === "string" ? text : await text(user),
            );
        }

        return next();
    };
}
