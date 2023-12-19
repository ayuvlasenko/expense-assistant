import { Context } from "telegraf";
import { message as telegrafMessage } from "telegraf/filters";
import { CallbackQuery, Message, Update } from "telegraf/types";
import { TelegramButtonService } from "../buttons/telegram-button.service";
import { State } from "../types/scenes";
import { stepHash } from "./hash";

// modified telegraf's message filter to ignore commands
export const message: typeof telegrafMessage = ((
    ...args: Parameters<typeof telegrafMessage>
) => {
    return (update: Context["update"]) => {
        if (!telegrafMessage(...args)(update)) {
            return false;
        }

        return !command()(update);
    };
}) as typeof telegrafMessage;

export function callbackQuery() {
    return (
        update: Context["update"],
        state?: State,
    ): update is Update.CallbackQueryUpdate<CallbackQuery.DataQuery> => {
        if (!("callback_query" in update && "data" in update.callback_query)) {
            return false;
        }

        if (!state) {
            return true;
        }

        try {
            const { hash } = TelegramButtonService.parseCallbackButtonData(
                update.callback_query.data,
            );

            if (hash === stepHash(state)) {
                return true;
            }
        } catch {
            // ignore
        }

        return false;
    };
}

export function command(name?: string) {
    return (
        update: Context["update"],
    ): update is Update.MessageUpdate<Message.TextMessage> => {
        if (!telegrafMessage("text")(update)) {
            return false;
        }

        const first = update.message.entities?.[0];
        if (first?.type !== "bot_command") {
            return false;
        }
        if (first.offset > 0) {
            return false;
        }
        const [cmdPart, to] = update.message.text
            .slice(0, first.length)
            .split("@");

        if (!cmdPart) {
            return false;
        }
        // always check for bot's own username case-insensitively
        if (
            to &&
            "me" in update &&
            typeof update.me === "string" &&
            to.toLowerCase() !== update.me.toLowerCase()
        ) {
            return false;
        }
        const cmd = cmdPart.slice(1);

        return !name || cmd === name;
    };
}

export function mergeFilters(
    filters: ((update: Context["update"], state?: State) => boolean)[],
): (update: Update, state?: State) => boolean {
    return (update: Update, state?: State): boolean => {
        for (const filter of filters) {
            if (
                typeof filter === "string"
                    ? filter in update ||
                      ("message" in update && filter in update.message)
                    : filter(update, state)
            ) {
                return true;
            }
        }

        return false;
    };
}
