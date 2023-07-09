import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { envValidationSchema } from "./config/env-validation.schema";
import { CurrencyModule } from "./currency/currency.module";
import { TelegramBotModule } from "./telegram-bot/telegram-bot.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            validationSchema: envValidationSchema,
        }),
        CurrencyModule,
        TelegramBotModule,
    ],
})
export class AppModule {}
