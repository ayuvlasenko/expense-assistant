import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Context } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { validate as validateUuid } from "uuid";
import { AccountService } from "~/account/account.service";
import { PropertiesByType } from "~/common/types";
import { EnvValidationSchema } from "~/config/env-validation.schema";
import { TelegramButtonService } from "~/telegram-bot/buttons/telegram-button.service";
import { callbackQuery, command } from "~/telegram-bot/helpers/filters";
import { exitOn, nextOn, paginate } from "~/telegram-bot/helpers/middlewares";
import {
    BeforeHandleInputActions,
    State,
    Step,
} from "~/telegram-bot/types/scenes";

@Injectable()
export class ChooseAccountStepService {
    constructor(
        private readonly accountService: AccountService,
        private readonly configService: ConfigService<
            EnvValidationSchema,
            true
        >,
        private readonly telegramButtonService: TelegramButtonService,
    ) {}

    build<
        TPayload,
        TProperty extends PropertiesByType<TPayload, string>,
    >(options: {
        name: string;
        text: string;
        property: TProperty;
    }): Step<TPayload> {
        return {
            name: options.name,
            onEnter: async (context, next, state) => {
                const buttons = await this.buildButtons({
                    state,
                    page: 0,
                    itemsPerPage: this.configService.get("ACCOUNTS_PER_PAGE"),
                });

                if (!buttons.length) {
                    await context.reply("You don't have any accounts");
                    return;
                }

                await context.reply(options.text, {
                    reply_markup: { inline_keyboard: buttons },
                });

                return next();
            },
            beforeHandleInput: [
                exitOn(command("cancel")),
                nextOn(callbackQuery()),
                paginate(this.changeAccountsPage.bind(this)),
            ],
            handleInput: async (context, actions, state) => {
                if (!context.has(callbackQuery())) {
                    return;
                }

                const { payload: accountId } =
                    TelegramButtonService.parseCallbackButtonData(
                        context.callbackQuery.data,
                    );

                if (
                    !(typeof accountId === "string") ||
                    !validateUuid(accountId)
                ) {
                    await context.reply(
                        "Invalid account id, try starting over",
                    );
                    await context.answerCbQuery();
                    return actions.exit();
                }

                state.payload[options.property] =
                    accountId as TPayload[TProperty];

                await context.answerCbQuery();

                return actions.next();
            },
        };
    }

    private async changeAccountsPage(
        context: Context,
        actions: BeforeHandleInputActions,
        state: State,
        page: number,
    ): Promise<void> {
        const buttons = await this.buildButtons({
            state,
            page: page,
            itemsPerPage: this.configService.get("ACCOUNTS_PER_PAGE"),
        });

        if (buttons.length) {
            await context.editMessageReplyMarkup({ inline_keyboard: buttons });
            return;
        }

        await context.reply("You don't have any accounts");

        return actions.exit();
    }

    private async buildButtons(options: {
        state: State;
        page: number;
        itemsPerPage: number;
    }): Promise<InlineKeyboardButton.CallbackButton[][]> {
        const [accounts, totalItems] = await this.accountService.findAndCount({
            user: options.state.user,
            skip: options.page * options.itemsPerPage,
            take: options.itemsPerPage,
        });

        if (!accounts.length) {
            return [];
        }

        const buttons: InlineKeyboardButton.CallbackButton[][] = accounts.map(
            (account) => [
                this.telegramButtonService.buildCallbackButton({
                    state: options.state,
                    text: `${account.name} ${account.currency.code}`,
                    payload: account.id,
                }),
            ],
        );

        return this.telegramButtonService.addPageButtons({
            state: options.state,
            buttons,
            totalItems,
            page: options.page,
            itemsPerPage: options.itemsPerPage,
        });
    }
}
