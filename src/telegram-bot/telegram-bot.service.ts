import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { EnvValidationSchema } from "~/config/env-validation.schema";

@Injectable()
export class TelegramBotService implements OnModuleInit {
    private bot!: Telegraf;

    constructor(
        private readonly configService: ConfigService<
            EnvValidationSchema,
            true
        >,
    ) {}

    async onModuleInit(): Promise<void> {
        const botToken = this.configService.get("TELEGRAM_BOT_TOKEN", {
            infer: true,
        });

        this.bot = new Telegraf(botToken);

        this.bot.on(message("text"), (ctx) => {
            void ctx.reply(`Hello ${ctx.message.from.first_name}!`);
        });

        const domain = this.configService.get("TELEGRAM_WEBHOOK_DOMAIN", {
            infer: true,
        });
        const port = this.configService.get("TELEGRAM_WEBHOOK_PORT", {
            infer: true,
        });

        await this.bot.launch({
            webhook: {
                domain,
                port,
            },
        });
    }
}
