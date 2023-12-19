import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AccountModule } from "~/account/account.module";
import { BalanceModule } from "~/balance/balance.module";
import { CurrencyModule } from "~/currency/currency.module";
import { TelegramBotModule } from "~/telegram-bot/telegram-bot.module";
import { CreateAccountSceneService } from "./scenes/create-account.scene-service";
import { DeleteAccountSceneService } from "./scenes/delete-account.scene-service";
import { ChooseAccountStepService } from "./steps/choose-account.step-service";
import { ChooseDateStepService } from "./steps/choose-date.step-service";
import { SumStepService } from "./steps/sum.step-service";
import { TextStepService } from "./steps/text.step-service";
import { TelegramBotSceneService } from "./telegram-bot-scene.service";

@Module({
    imports: [
        TelegramBotModule,
        AccountModule,
        BalanceModule,
        ConfigModule,
        CurrencyModule,
    ],
    providers: [
        TelegramBotSceneService,
        CreateAccountSceneService,
        DeleteAccountSceneService,
        ChooseAccountStepService,
        ChooseDateStepService,
        SumStepService,
        TextStepService,
    ],
})
export class TelegramBotSceneModule {}
