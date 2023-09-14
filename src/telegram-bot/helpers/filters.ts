import { Context } from "telegraf";
import { message as telegrafMessage } from "telegraf/filters";
import { Message, Update } from "telegraf/typings/core/types/typegram";

export function message(...args: Parameters<typeof telegrafMessage>) {
    return (
        update: Context["update"],
    ): update is Update.MessageUpdate<Message.TextMessage> => {
        if (!telegrafMessage(...args)(update)) {
            return false;
        }

        return !command()(update);
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
