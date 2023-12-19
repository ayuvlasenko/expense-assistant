import { BadRequestException, Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { InlineKeyboardButton } from "telegraf/types";
import { parseDate } from "~/common/parsers";
import { PropertiesByType } from "~/common/types";
import { TelegramButtonService } from "~/telegram-bot/buttons/telegram-button.service";
import {
    callbackQuery,
    command,
    message,
} from "~/telegram-bot/helpers/filters";
import { exitOn, nextOn, skipOn } from "~/telegram-bot/helpers/middlewares";
import { State, Step } from "~/telegram-bot/types/scenes";
import { DateButtonType } from "../enums/date-button-type.enum";

@Injectable()
export class ChooseDateStepService {
    constructor(
        private readonly telegramButtonService: TelegramButtonService,
    ) {}

    build<
        TPayload,
        TProperty extends PropertiesByType<TPayload, Date | undefined>,
    >(options: {
        name: string;
        text: string;
        isOptional?: boolean;
        property: TProperty;
    }): Step<TPayload> {
        return {
            name: options.name,
            onEnter: async (context, next, state) => {
                await context.reply(options.text, {
                    reply_markup: {
                        inline_keyboard: this.buildDateButtons(state),
                    },
                });

                return next();
            },
            beforeHandleInput: options.isOptional
                ? [
                      exitOn(command("cancel")),
                      skipOn(command("skip")),
                      nextOn(message("text"), callbackQuery()),
                  ]
                : [
                      exitOn(command("cancel")),
                      nextOn(message("text"), callbackQuery()),
                  ],
            handleInput: async (context, actions, state) => {
                if (!context.has([message("text"), callbackQuery()])) {
                    return;
                }

                if (context.callbackQuery?.data) {
                    try {
                        state.payload[options.property] =
                            this.parseCallbackQueryData(
                                context.callbackQuery.data,
                            ) as TPayload[TProperty];
                    } finally {
                        await context.answerCbQuery();
                    }
                } else if (context.message?.text) {
                    state.payload[options.property] = parseDate(
                        context.message.text,
                    )[0] as TPayload[TProperty];
                }

                return actions.next();
            },
        };
    }

    private buildDateButtons(
        state: State,
    ): InlineKeyboardButton.CallbackButton[][] {
        return [
            [
                this.telegramButtonService.buildCallbackButton({
                    text: "Today",
                    payload: DateButtonType.TODAY,
                    state,
                }),
            ],
            [
                this.telegramButtonService.buildCallbackButton({
                    text: "Yesterday",
                    payload: DateButtonType.YESTERDAY,
                    state,
                }),
            ],
        ];
    }

    private parseCallbackQueryData(data: string): Date {
        const { payload: buttonType } =
            TelegramButtonService.parseCallbackButtonData(data);

        if (buttonType === DateButtonType.TODAY) {
            return new Date();
        }

        if (buttonType === DateButtonType.YESTERDAY) {
            return DateTime.utc().plus({ days: -1 }).toJSDate();
        }

        throw new BadRequestException(`Invalid date button payload '${data}'`);
    }
}
