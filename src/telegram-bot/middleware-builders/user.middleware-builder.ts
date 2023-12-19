import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Context, Middleware } from "telegraf";
import { EnvValidationSchema } from "~/config/env-validation.schema";
import { UserService, userStorage } from "~/user/user.service";
import { command } from "../helpers/filters";

@Injectable()
export class UserMiddlewareBuilder {
    constructor(
        private readonly configService: ConfigService<
            EnvValidationSchema,
            true
        >,
        private readonly userService: UserService,
    ) {}

    build(): Middleware<Context> {
        return async (context, next) => {
            const telegramId =
                context.message?.from.id ?? context.callbackQuery?.from.id;

            if (!telegramId) {
                return next();
            }

            let user = await this.userService.findOrCreate(String(telegramId));

            if (!user.isBanned) {
                return userStorage.run(user, () => {
                    return next();
                });
            }

            if (!context.has(command("start"))) {
                return;
            }

            const inviteToken = context.message.text.split(" ")[1];
            if (
                inviteToken !==
                this.configService.get("INVITE_TOKEN", { infer: true })
            ) {
                return;
            }

            user = await this.userService.unban(user);

            return userStorage.run(user, () => {
                return next();
            });
        };
    }
}
