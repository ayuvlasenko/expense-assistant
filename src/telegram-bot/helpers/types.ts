import { Context, NarrowedContext } from "telegraf/typings/context";
import * as tt from "telegraf/typings/telegram-types";

type MatchedContext<
    C extends Context,
    T extends tt.UpdateType | tt.MessageSubType,
> = NarrowedContext<C, tt.MountMap[T]>;

export type TextMessageContext = MatchedContext<Context, "text">;
