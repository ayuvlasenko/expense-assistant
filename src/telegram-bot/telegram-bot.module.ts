import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AccountModule } from "~/account/account.module";
import { CurrencyModule } from "~/currency/currency.module";
import { UserModule } from "~/user/user.module";
import { EnterSceneMiddlewareBuilder } from "./middleware-builders/enter-scene.middleware-builder";
import { HandleStepInputMiddlewareBuilder } from "./middleware-builders/handle-step-input.middleware-builder";
import { SessionMiddlewareBuilder } from "./middleware-builders/session.middleware-builder";
import { UserMiddlewareBuilder } from "./middleware-builders/user.middleware-builder";
import { TelegramSessionModule } from "./session/telegram-session.module";
import { TelegramBotService } from "./telegram-bot.service";
import { TelegramButtonService } from "./buttons/telegram-button.service";

@Module({
    imports: [
        ConfigModule,
        UserModule,
        AccountModule,
        CurrencyModule,
        TelegramSessionModule,
    ],
    providers: [
        TelegramBotService,
        TelegramButtonService,
        EnterSceneMiddlewareBuilder,
        HandleStepInputMiddlewareBuilder,
        UserMiddlewareBuilder,
        SessionMiddlewareBuilder,
    ],
    exports: [TelegramBotService, TelegramButtonService],
})
export class TelegramBotModule {}
