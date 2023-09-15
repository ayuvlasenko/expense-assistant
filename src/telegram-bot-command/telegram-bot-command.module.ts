import { Module } from "@nestjs/common";
import { TelegramBotStartCommandService } from "./telegram-bot-start-command.service";
import { TelegramBotModule } from "~/telegram-bot/telegram-bot.module";

@Module({
    imports: [TelegramBotModule],
    providers: [TelegramBotStartCommandService],
})
export class TelegramBotCommandModule {}
