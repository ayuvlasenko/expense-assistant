import { Injectable } from "@nestjs/common";
import { BaseSceneMiddlewareBuilder } from "./base-scene.middleware-builder";
import { Context, MiddlewareFn as TelegrafMiddleware } from "telegraf";
import { Scene, State } from "../types/scenes";
import { TelegramSessionService } from "../session/telegram-session.service";
import { CommonError } from "~/common/common-error";
import { UserService } from "~/user/user.service";
import { runMiddlewares } from "../helpers/middlewares";

@Injectable()
export class EnterSceneMiddlewareBuilder extends BaseSceneMiddlewareBuilder {
    constructor(protected readonly sessionService: TelegramSessionService) {
        super(sessionService);
    }

    protected _build(scenes: Scene[]): TelegrafMiddleware<Context> {
        this.assertScenesAreValid(scenes);

        return async (context, next) => {
            const session = TelegramSessionService.getCurrent();

            if (!session || session.scene) {
                return next();
            }

            for (const scene of scenes) {
                if (!(await scene.shouldBeUsed(context))) {
                    continue;
                }

                const state: Pick<State, "user"> = {
                    user: UserService.getCurrentOrFail(),
                };

                if (
                    !(await this.runBeforeSceneMiddlewares(
                        context,
                        scene,
                        state,
                    ))
                ) {
                    return;
                }

                await this.enterStep(context, scene, 0, {
                    clearSessionOnError: true,
                });

                return;
            }

            return next();
        };
    }

    private async runBeforeSceneMiddlewares(
        context: Context,
        scene: Scene,
        state: Pick<State, "user">,
    ): Promise<boolean> {
        let before = scene.before ?? [];
        if (!Array.isArray(before)) {
            before = [before];
        }

        if (!before.length) {
            return true;
        }

        try {
            return await runMiddlewares(context, before, state);
        } catch (error) {
            const commonError = CommonError.fromUnknown(error);
            this.logger.error(
                commonError.message,
                commonError.stack,
                {
                    user: UserService.getCurrentOrFail(),
                    sceneName: scene.name,
                    update: context.update,
                },
                "runBeforeSceneMiddlewares",
            );

            return false;
        }
    }
}
