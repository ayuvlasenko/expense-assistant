import { Injectable } from "@nestjs/common";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { AccountService } from "~/account/account.service";
import { ButtonType } from "~/telegram-bot/buttons/enums/button-type.enum";
import { TelegramButtonService } from "~/telegram-bot/buttons/telegram-button.service";
import { State } from "~/telegram-bot/types/scenes";

@Injectable()
export class AccountsButtonService {
    constructor(
        private readonly accountService: AccountService,
        private readonly telegramButtonService: TelegramButtonService,
    ) {}

    async changePage(options: {
        state: State;
        currentPage: number;
        itemsPerPage: number;
        buttonType: ButtonType.NEXT | ButtonType.PREVIOUS;
    }): Promise<{
        currentPage: number;
        buttons: InlineKeyboardButton.CallbackButton[][];
    }> {
        let newCurrentPage =
            options.buttonType === ButtonType.PREVIOUS
                ? options.currentPage - 1
                : options.currentPage + 1;

        if (newCurrentPage < 0) {
            newCurrentPage = 0;
        }

        const buttons = await this.build({
            state: options.state,
            currentPage: newCurrentPage,
            itemsPerPage: options.itemsPerPage,
        });

        return { currentPage: newCurrentPage, buttons };
    }

    async build(options: {
        state: State;
        currentPage: number;
        itemsPerPage: number;
    }): Promise<InlineKeyboardButton.CallbackButton[][]> {
        const [accounts, totalItems] = await this.accountService.findAndCount({
            user: options.state.user,
            skip: options.currentPage * options.itemsPerPage,
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

        return this.telegramButtonService.addPrevNextButtons({
            state: options.state,
            buttons,
            totalItems,
            currentPage: options.currentPage,
            itemsPerPage: options.itemsPerPage,
        });
    }
}
