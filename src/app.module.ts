import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { envValidationSchema } from "./config/env-validation.schema";
import { TypeOrmConfigService } from "./db/type-orm-config.service";
import { TelegramBotModule } from "./telegram-bot/telegram-bot.module";
import { CurrencyModule } from "./currency/currency.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            validationSchema: envValidationSchema,
        }),
        CurrencyModule,
        TelegramBotModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: TypeOrmConfigService,
        }),
    ],
})
export class AppModule {}
