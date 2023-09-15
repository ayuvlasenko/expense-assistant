import { Injectable, OnModuleInit } from "@nestjs/common";
import { Context } from "telegraf";
import { TelegramBotService } from "~/telegram-bot/telegram-bot.service";

@Injectable()
export class TelegramBotStartCommandService implements OnModuleInit {
    constructor(private readonly telegramBotService: TelegramBotService) {}

    onModuleInit(): void {
        this.telegramBotService.composer.command(
            "start",
            this.onStartCommand.bind(this),
        );
    }

    async onStartCommand(context: Context): Promise<void> {
        await context.reply("Welcome! I'm your personal finance manager!");
    }
}
