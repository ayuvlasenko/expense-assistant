import { Injectable } from "@nestjs/common";
import { throwIfEmpty } from "rxjs";
import { message } from "telegraf/filters";
import { AccountService } from "~/account/account.service";
import { CategoryService } from "~/category/category.service";
import { canParseOperation, tryParseOperation } from "~/common/parsers";
import { command } from "~/telegram-bot/helpers/filters";
import { replyOn, useIf } from "~/telegram-bot/helpers/middlewares";
import { Scene, Step } from "~/telegram-bot/types/scenes";

export interface CreateOperationScenePayload {
    firstOperation: {
        accountId?: string;
        sum: number;
        currencyId: string;
    };
    secondOperation: {
        accountId?: string;
        sum: number;
        currencyId: string;
    };
    executedAt: Date;
    description?: string;
    category?: string;
}

@Injectable()
export class CreateOperationSceneService {
    constructor(
        private readonly accountService: AccountService,
        private readonly categoryService: CategoryService,
    ) {}

    build(): Scene<CreateOperationScenePayload> {
        return {
            name: "create-operation",
            shouldBeUsed: useIf(
                (update) =>
                    message("text")(update) &&
                    canParseOperation(update.message.text),
            ),
            before: [
                async (context, next, state) => {
                    if (await this.accountService.hasAnyAccounts(state.user)) {
                        return next();
                    }

                    await context.reply("You don't have any accounts");
                },
                async (context, next, state) => {
                    if (!context.has(message("text"))) {
                        return;
                    }

                    const [firstOperation, secondOperation] =
                        tryParseOperation(context.message.text) ?? [];

                    if (!firstOperation) {
                        return;
                    }

                    if (firstOperation.category) {
                        const category = await this.categoryService.findOne(
                            firstOperation.category,
                            state.user,
                        );
                    }
                },
            ],
            steps: [this.operationPreviewStep()],
            after: [
                replyOn("Ok, canceled", command("cancel")),
                async (context, next, state) => {
                    await context.reply(
                        `Operation created! ${JSON.stringify(state.payload)}`,
                    );
                },
            ],
        };
    }

    private operationPreviewStep(): Step<CreateOperationScenePayload> {
        return {
            name: "operation-preview",
            beforeHandleInput: () => {},
        };
    }
}
