import { Injectable } from "@nestjs/common";
import { Context, Middleware } from "telegraf";
import { UserService } from "~/user/user.service";
import {
    TelegramSessionService,
    telegramSessionStorage,
} from "../session/telegram-session.service";

@Injectable()
export class SessionMiddlewareBuilder {
    constructor(private readonly sessionService: TelegramSessionService) {}

    build(): Middleware<Context> {
        return async (_context, next) => {
            const user = UserService.getCurrent();

            const session =
                (await this.sessionService.find(user)) ??
                (await this.sessionService.createOrUpdate({
                    user,
                }));

            telegramSessionStorage.run(session, () => {
                void next();
            });
        };
    }
}
