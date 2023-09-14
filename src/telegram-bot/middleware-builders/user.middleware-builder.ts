import { Injectable } from "@nestjs/common";
import { Context, Middleware } from "telegraf";
import { UserService, userStorage } from "~/user/user.service";
import { command } from "../helpers/filters";
import { filterContext } from "../helpers/types";
import { ConfigService } from "@nestjs/config";
import { EnvValidationSchema } from "~/config/env-validation.schema";

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
            const telegramId = context.message?.from.id;

            if (!telegramId) {
                return next();
            }

            let user = await this.userService.findOrCreate(String(telegramId));

            if (!user.isBanned) {
                return userStorage.run(user, () => {
                    return next();
                });
            }

            if (!filterContext(context, command("start"))) {
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

            await context.reply("Hi! Feel free to use the bot");
        };
    }
}
