import { Injectable } from "@nestjs/common";
import { Context, Middleware } from "telegraf";
import { UserService, userStorage } from "~/user/user.service";

@Injectable()
export class UserMiddlewareBuilder {
    constructor(private readonly userService: UserService) {}

    build(): Middleware<Context> {
        return async (context, next) => {
            const telegramId = context.message?.from.id;

            if (!telegramId) {
                return next();
            }

            const user = await this.userService.findOrCreate(
                String(telegramId),
            );

            userStorage.run(user, () => {
                void next();
            });
        };
    }
}
