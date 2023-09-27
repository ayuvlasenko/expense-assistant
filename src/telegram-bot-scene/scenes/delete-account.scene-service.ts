import { Injectable } from "@nestjs/common";
import { Context } from "telegraf";
import { validate as validateUuid } from "uuid";
import { AccountService } from "~/account/account.service";
import { ButtonType } from "~/telegram-bot/buttons/enums/button-type.enum";
import { TelegramButtonService } from "~/telegram-bot/buttons/telegram-button.service";
import { callbackQuery, command } from "~/telegram-bot/helpers/filters";
import {
    exitOn,
    nextOn,
    nextOnCallbackQuery,
    paginate,
    replyOn,
    useIf,
} from "~/telegram-bot/helpers/middlewares";
import { assertContext } from "~/telegram-bot/helpers/types";
import {
    BeforeHandleInputActions,
    Scene,
    State,
    Step,
} from "~/telegram-bot/types/scenes";
import { AccountsButtonService } from "../buttons/accounts.button-service";
import { ACCOUNTS_PER_PAGE } from "../telegram-bot-scene.constants";

export interface DeleteAccountScenePayload {
    accountId: string;
    currentPage: number;
}

@Injectable()
export class DeleteAccountSceneService {
    constructor(
        private readonly accountsButtonService: AccountsButtonService,
        private readonly accountService: AccountService,
    ) {}

    build(): Scene<DeleteAccountScenePayload> {
        return {
            name: "delete-account",
            commandDescription: {
                command: "delete_account",
                description: "Delete account",
            },
            shouldBeUsed: useIf(command("delete_account")),
            before: async (context, next, state) => {
                const [accounts] = await this.accountService.findAndCount({
                    user: state.user,
                    take: 1,
                    skip: 0,
                });

                if (accounts.length) {
                    return next();
                }

                await context.reply("You don't have any accounts");
            },
            steps: [this.showAccountsStep(), this.confirmAccountDeletionStep()],
            after: [replyOn("Ok, canceled", command("cancel"))],
        };
    }

    private showAccountsStep(): Step<DeleteAccountScenePayload> {
        return {
            name: "show-accounts",
            onEnter: async (context, next, state) => {
                state.payload.currentPage = 0;

                const buttons = await this.accountsButtonService.build({
                    state,
                    currentPage: state.payload.currentPage,
                    itemsPerPage: ACCOUNTS_PER_PAGE,
                });

                if (!buttons.length) {
                    await context.reply("You don't have any accounts");
                    return;
                }

                await context.reply("Choose account to delete: (or /cancel)", {
                    reply_markup: { inline_keyboard: buttons },
                });

                return next();
            },
            beforeHandleInput: [
                exitOn(command("cancel")),
                nextOnCallbackQuery(),
                paginate(this.changeAccountsPage.bind(this)),
            ],
            handleInput: async (context, actions, state) => {
                assertContext(context, callbackQuery());

                const { payload: accountId } =
                    TelegramButtonService.parseCallbackButtonPayload(
                        context.callbackQuery.data,
                    );

                if (
                    !(typeof accountId === "string") ||
                    !validateUuid(accountId)
                ) {
                    await context.reply(
                        "Invalid account id, run delete command again",
                    );
                    await context.answerCbQuery();
                    return actions.exit();
                }

                state.payload.accountId = accountId;

                await context.answerCbQuery();

                return actions.next();
            },
        };
    }

    private confirmAccountDeletionStep(): Step<DeleteAccountScenePayload> {
        return {
            name: "confirm-account-deletion",
            onEnter: async (context, next, state) => {
                const account = state.payload.accountId
                    ? await this.accountService.findOneById(
                          state.payload.accountId,
                      )
                    : null;

                if (!account) {
                    await context.reply("Account not found");
                    return;
                }

                await context.reply(
                    `Are you sure you want to delete ${account.name} ${account.currency.code}? (/confirm or /cancel)`,
                );

                return next();
            },
            beforeHandleInput: [
                exitOn(command("cancel")),
                nextOn(command("confirm")),
            ],
            handleInput: async (context, actions, state) => {
                assertContext(context, command("confirm"));

                const account = state.payload.accountId
                    ? await this.accountService.findOneById(
                          state.payload.accountId,
                      )
                    : null;

                if (!account) {
                    await context.reply("Account not found");
                    return;
                }

                await this.accountService.softDelete(account.id);

                await context.reply(
                    `Account ${account.name} ${account.currency.code} deleted`,
                );

                return actions.next();
            },
        };
    }

    private async changeAccountsPage(
        context: Context,
        actions: BeforeHandleInputActions,
        state: State<DeleteAccountScenePayload>,
        buttonType: ButtonType.PREVIOUS | ButtonType.NEXT,
    ): Promise<void> {
        const { currentPage, buttons } =
            await this.accountsButtonService.changePage({
                state,
                currentPage: state.payload.currentPage ?? 0,
                itemsPerPage: ACCOUNTS_PER_PAGE,
                buttonType,
            });

        state.payload.currentPage = currentPage;

        if (buttons.length) {
            await context.editMessageReplyMarkup({ inline_keyboard: buttons });
            return;
        }

        await context.reply("You don't have any accounts");

        return actions.exit();
    }
}
