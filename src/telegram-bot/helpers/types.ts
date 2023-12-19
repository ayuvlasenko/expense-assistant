import {
    MessageSubType,
    MountMap,
    UpdateType,
} from "node_modules/telegraf/typings/telegram-types";
import { Context, NarrowedContext } from "telegraf";

type MatchedContext<
    C extends Context,
    T extends UpdateType | MessageSubType,
> = NarrowedContext<C, MountMap[T]>;

export type TextMessageContext = MatchedContext<Context, "text">;
