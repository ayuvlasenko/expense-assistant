import { Module } from "@nestjs/common";
import { TelegramBotSceneService } from "./telegram-bot-scene.service";
import { TelegramBotModule } from "~/telegram-bot/telegram-bot.module";
import { CreateAccountSceneService } from "./scenes/create-account.scene-service";
import { AccountModule } from "~/account/account.module";
import { CurrencyModule } from "~/currency/currency.module";
import { BalanceModule } from "~/balance/balance.module";

@Module({
    imports: [TelegramBotModule, AccountModule, BalanceModule, CurrencyModule],
    providers: [TelegramBotSceneService, CreateAccountSceneService],
})
export class TelegramBotSceneModule {}
