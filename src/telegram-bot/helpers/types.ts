import { InternalServerErrorException } from "@nestjs/common";
import {
    Context,
    FilteredContext,
    NarrowedContext,
} from "telegraf/typings/context";
import * as tt from "telegraf/typings/telegram-types";
import { Guard } from "telegraf/typings/util";
import { MaybeArray } from "~/common/types";
import { mergeFilters } from "./filters";

type MatchedContext<
    C extends Context,
    T extends tt.UpdateType | tt.MessageSubType,
> = NarrowedContext<C, tt.MountMap[T]>;

export type TextMessageContext = MatchedContext<Context, "text">;

export function assertContext<Filter extends Guard<Context["update"]>>(
    context: Context,
    maybeFilters: MaybeArray<Filter>,
): asserts context is FilteredContext<Context, Filter> {
    if (!filterContext(context, maybeFilters)) {
        throw new InternalServerErrorException(
            "Context doesn't match any of the filters",
        );
    }
}

export function filterContext<Filter extends Guard<Context["update"]>>(
    context: Context,
    maybeFilters: MaybeArray<Filter>,
): context is FilteredContext<Context, Filter> {
    const filters = Array.isArray(maybeFilters) ? maybeFilters : [maybeFilters];

    const predicate = mergeFilters(filters);

    return predicate(context.update);
}
