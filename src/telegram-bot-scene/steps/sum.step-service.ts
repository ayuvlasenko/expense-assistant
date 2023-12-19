import { Injectable } from "@nestjs/common";
import { parseNumber } from "~/common/parsers";
import { PropertiesByType } from "~/common/types";
import { command, message } from "~/telegram-bot/helpers/filters";
import {
    exitOn,
    nextOn,
    reply,
    skipOn,
} from "~/telegram-bot/helpers/middlewares";
import { Step } from "~/telegram-bot/types/scenes";

@Injectable()
export class SumStepService {
    build<
        TPayload,
        TProperty extends PropertiesByType<TPayload, number | undefined>,
    >(options: {
        name: string;
        text: string;
        isOptional?: boolean;
        property: TProperty;
    }): Step<TPayload> {
        return {
            name: options.name,
            onEnter: reply(options.text),
            beforeHandleInput: options.isOptional
                ? [
                      exitOn(command("cancel")),
                      skipOn(command("skip")),
                      nextOn(message("text")),
                  ]
                : [exitOn(command("cancel")), nextOn(message("text"))],
            handleInput: async (context, actions, state) => {
                if (!context.has(message("text"))) {
                    return;
                }

                const maybeSum = parseNumber(context.message.text);

                if (!maybeSum) {
                    await context.reply(
                        "Sum should be in format 123.45 or -123.45 (max 2 decimal places)",
                    );
                    return;
                }

                state.payload[options.property] =
                    maybeSum as TPayload[TProperty];

                return actions.next();
            },
        };
    }
}
