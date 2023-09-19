import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Context } from "telegraf";
import { AccountService } from "~/account/account.service";
import { BalanceService } from "~/balance/balance.service";
import { parseCurrencyCode, parseNumber } from "~/common/parsers";
import { MaybePromise } from "~/common/types";
import { CurrencyService } from "~/currency/currency.service";
import { command, message } from "~/telegram-bot/helpers/filters";
import {
    exitOn,
    nextOn,
    reply,
    replyOn,
    skipOn,
    useIf,
} from "~/telegram-bot/helpers/middlewares";
import { assertContext } from "~/telegram-bot/helpers/types";
import {
    ActionResult,
    AfterSceneState,
    BeforeHandleInputActions,
    Scene,
    Step,
} from "~/telegram-bot/types/scenes";

export interface CreateAccountScenePayload {
    name: string;
    currencyCode: string;
    initialSum?: number;
}

@Injectable()
export class CreateAccountSceneService {
    constructor(
        private readonly accountService: AccountService,
        private readonly currencyService: CurrencyService,
        private readonly balanceService: BalanceService,
    ) {}

    build(): Scene<CreateAccountScenePayload> {
        return {
            name: "create-account",
            commandDescription: {
                command: "create_account",
                description: "Create account",
            },
            shouldBeUsed: useIf(command("create_account")),
            before: [reply("Let's create a new account! (or /cancel)")],
            steps: [
                this.nameStep(),
                this.currencyStep(),
                this.initialSumStep(),
            ],
            after: [
                replyOn("Ok, canceled", command("cancel")),
                this.createAccount.bind(this),
            ],
        };
    }

    private nameStep(): Step<CreateAccountScenePayload> {
        return {
            name: "name",
            onEnter: reply("What is the name of the account?"),
            beforeHandleInput: [
                exitOn(command("cancel")),
                nextOn(message("text")),
            ],
            handleInput: async (context, actions, state) => {
                assertContext(context, message("text"));

                state.payload.name = context.message.text;

                return actions.next();
            },
        };
    }

    private currencyStep(): Step<CreateAccountScenePayload> {
        return {
            name: "currency",
            onEnter: reply("What is the currency code?"),
            beforeHandleInput: [
                exitOn(command("cancel")),
                nextOn(message("text")),
            ],
            handleInput: async (context, actions, state) => {
                assertContext(context, message("text"));

                const maybeCode = parseCurrencyCode(context.message.text);

                if (!maybeCode) {
                    await context.reply(
                        "Currency code must contain only uppercase latin letters",
                    );

                    return;
                }

                state.payload.currencyCode = maybeCode;

                return actions.next();
            },
        };
    }

    private initialSumStep(): Step<CreateAccountScenePayload> {
        return {
            name: "initial-sum",
            onEnter: reply("What is the initial sum? (or /skip)"),
            beforeHandleInput: [
                exitOn(command("cancel")),
                skipOn(command("skip")),
                nextOn(message("text")),
            ],
            handleInput: async (context, actions, state) => {
                assertContext(context, message("text"));

                const maybeSum = parseNumber(context.message.text);

                if (!maybeSum) {
                    await context.reply(
                        "Sum should be in format 123.45 or -123.45 (max 2 decimal places)",
                    );
                    return;
                }

                state.payload.initialSum = maybeSum;

                return actions.next();
            },
        };
    }

    private async createAccount(
        context: Context,
        next: () => MaybePromise<void>,
        state: AfterSceneState<CreateAccountScenePayload>,
        actionResult: ActionResult<BeforeHandleInputActions>,
    ): Promise<void> {
        if (actionResult.type !== "next" && actionResult.type !== "skip") {
            return next();
        }

        const { name, currencyCode } = state.payload;

        if (!name || !currencyCode) {
            throw new InternalServerErrorException("Invalid payload");
        }

        const currency = await this.currencyService.findOneOrCreate(
            currencyCode,
        );

        const account = await this.accountService.create(
            name,
            currency,
            state.user,
        );

        const { initialSum } = state.payload;
        if (initialSum) {
            await this.balanceService.create(account, initialSum);
        }

        await context.reply(
            `Account ${account.name} (${initialSum ?? ""}${
                account.currency.code
            }) created`,
        );

        return next();
    }
}
