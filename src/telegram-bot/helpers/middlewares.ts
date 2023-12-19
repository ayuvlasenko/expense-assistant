import { InternalServerErrorException } from "@nestjs/common";
import { User } from "@prisma/client";
import { Context } from "telegraf";
import { MaybeArray, MaybePromise } from "~/common/types";
import { UserService } from "~/user/user.service";
import { TelegramButtonService } from "../buttons/telegram-button.service";
import {
    ActionResult,
    BeforeHandleInputActions,
    BeforeHandleInputMiddleware,
    Middleware,
    State,
} from "../types/scenes";
import { callbackQuery, mergeFilters } from "./filters";

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

    const actions: Pick<BeforeHandleInputActions, "exit" | "skip"> = {
        exit: () => {
            actionResult = { type: "exit" };
        },
        skip: () => {
            actionResult = { type: "skip" };
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
    ...filters: ((update: Context["update"]) => boolean)[]
): (context: Context) => boolean {
    return (context) => {
        const predicate = mergeFilters(filters);

        return predicate(context.update);
    };
}

export function exitOn(
    ...filters: ((update: Context["update"]) => boolean)[]
): (context: Context, actions: BeforeHandleInputActions) => MaybePromise<void> {
    const predicate = mergeFilters(filters);

    return (context, actions) => {
        if (predicate(context.update)) {
            return actions.exit();
        }

        return actions.next();
    };
}

export function skipOn(
    ...filters: ((update: Context["update"]) => boolean)[]
): (context: Context, actions: BeforeHandleInputActions) => MaybePromise<void> {
    const predicate = mergeFilters(filters);

    return (context, actions) => {
        if (predicate(context.update)) {
            return actions.skip();
        }

        return actions.next();
    };
}

export function nextOn(
    ...filters: ((update: Context["update"], state?: State) => boolean)[]
): (
    context: Context,
    actions: BeforeHandleInputActions,
    state?: State,
) => MaybePromise<void> {
    const predicate = mergeFilters(filters);

    return (context, actions, state) => {
        if (predicate(context.update, state)) {
            return actions.next();
        }
    };
}

export function paginate(
    paginationCallback: (
        context: Context,
        actions: BeforeHandleInputActions,
        state: State,
        page: number,
    ) => MaybePromise<void>,
): (
    context: Context,
    actions: BeforeHandleInputActions,
    state: State,
) => MaybePromise<void> {
    return async (context, actions, state) => {
        if (!callbackQuery()(context.update)) {
            return actions.next();
        }

        try {
            const page = TelegramButtonService.parsePageButtonData(
                context.update.callback_query.data,
            );

            if (typeof page === "number" && page >= 0) {
                await paginationCallback(context, actions, state, page);
                await context.answerCbQuery();
                return;
            }

            return actions.next();
        } catch {
            // ignore
        }
    };
}

export function replyOn(
    maybeTexts: MaybeArray<string | ((user: User) => MaybePromise<string>)>,
    ...filters: ((update: Context["update"]) => boolean)[]
): (context: Context, next: () => MaybePromise<void>) => MaybePromise<void> {
    const predicate = mergeFilters(filters);
    const texts = Array.isArray(maybeTexts) ? maybeTexts : [maybeTexts];

    return async (context, next) => {
        return predicate(context.update)
            ? reply(...texts)(context, next)
            : next();
    };
}

export function reply(
    ...texts: (string | ((user: User) => MaybePromise<string>))[]
): (context: Context, next: () => MaybePromise<void>) => MaybePromise<void> {
    return async (context, next) => {
        const user = UserService.getCurrentOrFail();

        for (const text of texts) {
            await context.reply(
                typeof text === "string" ? text : await text(user),
            );
        }

        return next();
    };
}
