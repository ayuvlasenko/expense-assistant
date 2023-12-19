import { Injectable } from "@nestjs/common";
import { AccountService } from "~/account/account.service";
import { command } from "~/telegram-bot/helpers/filters";
import {
    exitOn,
    nextOn,
    replyOn,
    useIf,
} from "~/telegram-bot/helpers/middlewares";
import { Scene, Step } from "~/telegram-bot/types/scenes";
import { ChooseAccountStepService } from "../steps/choose-account.step-service";

export interface DeleteAccountScenePayload {
    accountId: string;
}

@Injectable()
export class DeleteAccountSceneService {
    constructor(
        private readonly accountService: AccountService,
        private readonly chooseAccountStepService: ChooseAccountStepService,
    ) {}

    build(): Scene<DeleteAccountScenePayload> {
        return {
            name: "delete-account",
            commandDescription: {
                command: "delete_account",
                description: "Delete account",
            },
            shouldBeUsed: useIf(command("delete_account")),
            steps: [this.accountStep(), this.confirmDeletionStep()],
            after: [replyOn("Ok, canceled", command("cancel"))],
        };
    }

    private accountStep(): Step<DeleteAccountScenePayload> {
        return this.chooseAccountStepService.build({
            name: "choose-account",
            text: "Choose account to delete: (or /cancel)",
            property: "accountId",
        });
    }

    private confirmDeletionStep(): Step<DeleteAccountScenePayload> {
        return {
            name: "confirm-deletion",
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
                    `Are you sure you want to delete ${account.name} ${account.currency.code}?\nIf you sure, send /confirm, overwise send /cancel.\nThis action cannot be undone.`,
                );

                return next();
            },
            beforeHandleInput: [
                exitOn(command("cancel")),
                nextOn(command("confirm")),
            ],
            handleInput: async (context, actions, state) => {
                if (!context.has(command("confirm"))) {
                    return;
                }

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
}
