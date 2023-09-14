import { InternalServerErrorException } from "@nestjs/common";
import {
    Context,
    FilteredContext,
    NarrowedContext,
} from "telegraf/typings/context";
import { Update } from "telegraf/typings/core/types/typegram";
import * as tt from "telegraf/typings/telegram-types";
import { Guard } from "telegraf/typings/util";
import { MaybeArray } from "~/common/types";

type MatchedContext<
    C extends Context,
    T extends tt.UpdateType | tt.MessageSubType,
> = NarrowedContext<C, tt.MountMap[T]>;

export type TextMessageContext = MatchedContext<Context, "text">;

export function assertContextType<Filter extends Guard<Context["update"]>>(
    context: Context,
    maybeFilters: MaybeArray<Filter>,
): asserts context is FilteredContext<Context, Filter> {
    const filters = Array.isArray(maybeFilters) ? maybeFilters : [maybeFilters];

    const predicate = (update: Update): update is Update => {
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

    if (!predicate(context.update)) {
        throw new InternalServerErrorException(
            "Context doesn't match any of the filters",
        );
    }
}
