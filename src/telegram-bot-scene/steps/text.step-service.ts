import { Injectable } from "@nestjs/common";
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
export class TextStepService {
    build<
        TPayload,
        TProperty extends PropertiesByType<TPayload, string | undefined>,
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

                state.payload[options.property] = context.message
                    .text as TPayload[TProperty];

                return actions.next();
            },
        };
    }
}
