import { InternalServerErrorException } from "@nestjs/common";
import {
    Context,
    FilteredContext,
    NarrowedContext,
} from "telegraf/typings/context";
import * as tt from "telegraf/typings/telegram-types";
import { Guard } from "telegraf/typings/util";
import { mergeFilters } from "./filters";

type MatchedContext<
    C extends Context,
    T extends tt.UpdateType | tt.MessageSubType,
> = NarrowedContext<C, tt.MountMap[T]>;

export type TextMessageContext = MatchedContext<Context, "text">;

export function assertContext<Filter extends Guard<Context["update"]>>(
    context: Context,
    ...filters: Filter[]
): asserts context is FilteredContext<Context, Filter> {
    if (!filterContext(context, ...filters)) {
        throw new InternalServerErrorException(
            "Context doesn't match any of the filters",
        );
    }
}

export function filterContext<Filter extends Guard<Context["update"]>>(
    context: Context,
    ...filters: Filter[]
): context is FilteredContext<Context, Filter> {
    const predicate = mergeFilters(filters);

    return predicate(context.update);
}
