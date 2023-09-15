import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { envValidationSchema } from "./config/env-validation.schema";
import { CurrencyModule } from "./currency/currency.module";
import { TelegramBotModule } from "./telegram-bot/telegram-bot.module";
import { TelegramBotSceneModule } from "./telegram-bot-scene/telegram-bot-scene.module";
import { TelegramBotCommandModule } from "./telegram-bot-command/telegram-bot-command.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            validationSchema: envValidationSchema,
        }),
        CurrencyModule,
        TelegramBotCommandModule,
        TelegramBotModule,
        TelegramBotSceneModule,
    ],
})
export class AppModule {}
