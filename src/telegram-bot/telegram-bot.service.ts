import {
    Injectable,
    InternalServerErrorException,
    Logger,
    OnApplicationBootstrap,
    OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Composer, Telegraf } from "telegraf";
import { EnvValidationSchema } from "~/config/env-validation.schema";
import { EnterSceneMiddlewareBuilder } from "./middleware-builders/enter-scene.middleware-builder";
import { HandleStepInputMiddlewareBuilder } from "./middleware-builders/handle-step-input.middleware-builder";
import { SessionMiddlewareBuilder } from "./middleware-builders/session.middleware-builder";
import { UserMiddlewareBuilder } from "./middleware-builders/user.middleware-builder";
import { CommandDescription, Scene } from "./types/scenes";

@Injectable()
export class TelegramBotService
    implements OnModuleInit, OnApplicationBootstrap
{
    private bot!: Telegraf;
    private readonly scenes: Scene[] = [];
    private readonly _composer = new Composer();
    private isLaunched = false;
    private readonly logger = new Logger(this.constructor.name);
    private readonly commands: CommandDescription[] = [];

    constructor(
        private readonly configService: ConfigService<
            EnvValidationSchema,
            true
        >,
        private readonly enterSceneMiddlewareBuilder: EnterSceneMiddlewareBuilder,
        private readonly handleStepInputMiddlewareBuilder: HandleStepInputMiddlewareBuilder,
        private readonly sessionMiddlewareBuilder: SessionMiddlewareBuilder,
        private readonly userMiddlewareBuilder: UserMiddlewareBuilder,
    ) {}

    get composer() {
        return this._composer;
    }

    get telegram() {
        return this.bot.telegram;
    }

    addScene(scene: Scene) {
        if (this.isLaunched) {
            throw new InternalServerErrorException(
                "Can't set scenes after launching bot",
            );
        }

        const existingScene = this.scenes.find(
            (item) => item.name === scene.name,
        );

        if (existingScene) {
            throw new InternalServerErrorException(
                `Scene with name "${scene.name}" already exists`,
            );
        }

        if (scene.commandDescription) {
            this.addCommandDescription(scene.commandDescription);
        }

        this.scenes.push(scene);
    }

    addCommandDescription(command: CommandDescription) {
        if (this.isLaunched) {
            throw new InternalServerErrorException(
                "Can't set commands after launching bot",
            );
        }

        const existingCommand = this.commands.find(
            (item) => item.command === command.command,
        );

        if (existingCommand) {
            throw new InternalServerErrorException(
                `Command with name "${command.command}" already exists`,
            );
        }

        this.commands.push(command);
    }

    onModuleInit(): void {
        const botToken = this.configService.get("TELEGRAM_BOT_TOKEN", {
            infer: true,
        });

        this.bot = new Telegraf(botToken);
    }

    async onApplicationBootstrap(): Promise<void> {
        this.bot.use(
            this.userMiddlewareBuilder.build(),
            this.sessionMiddlewareBuilder.build(),
        );

        if (this.scenes.length) {
            this.bot.use(
                this.enterSceneMiddlewareBuilder.build(this.scenes),
                this.handleStepInputMiddlewareBuilder.build(this.scenes),
            );
        }

        if (this.commands.length) {
            await this.bot.telegram.setMyCommands(this.commands);
        } else {
            await this.bot.telegram.deleteMyCommands();
        }

        this.bot.use(this.composer.middleware());

        const useLongPolling = this.configService.get(
            "TELEGRAM_USE_LONG_POLLING",
            {
                infer: true,
            },
        );

        if (useLongPolling) {
            void this.bot.launch();
        } else {
            const domain = this.configService.get("TELEGRAM_WEBHOOK_DOMAIN", {
                infer: true,
            });
            const port = this.configService.get("TELEGRAM_WEBHOOK_PORT", {
                infer: true,
            });
            const secretToken = this.configService.get(
                "TELEGRAM_WEBHOOK_SECRET_TOKEN",
                {
                    infer: true,
                },
            );

            await this.bot.launch({
                webhook: {
                    domain,
                    port,
                    secretToken,
                },
            });
        }

        this.isLaunched = true;
    }
}
