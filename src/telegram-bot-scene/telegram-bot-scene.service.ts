import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { TelegramBotService } from "~/telegram-bot/telegram-bot.service";
import { CreateAccountSceneService } from "./scenes/create-account.scene-service";
import { DeleteAccountSceneService } from "./scenes/delete-account.scene-service";

@Injectable()
export class TelegramBotSceneService implements OnModuleInit {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly botService: TelegramBotService,
        private readonly createAccountSceneService: CreateAccountSceneService,
        private readonly deleteAccountSceneService: DeleteAccountSceneService,
    ) {}

    onModuleInit() {
        this.botService.addScene(this.createAccountSceneService.build());
        this.botService.addScene(this.deleteAccountSceneService.build());
    }
}
