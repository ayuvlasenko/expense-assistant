import { InternalServerErrorException, Logger } from "@nestjs/common";
import { Context, MiddlewareFn as TelegrafMiddleware } from "telegraf";
import { CommonError } from "~/common/common-error";
import { UserService } from "~/user/user.service";
import { TelegramSessionService } from "../session/telegram-session.service";
import { Scene, State } from "../types/scenes";
import { runMiddlewares } from "../helpers/middlewares";

export abstract class BaseSceneMiddlewareBuilder {
    protected readonly logger: Logger;

    constructor(protected readonly sessionService: TelegramSessionService) {
        this.logger = new Logger(this.constructor.name);
    }

    build(scenes: Scene[]): TelegrafMiddleware<Context> {
        this.assertScenesAreValid(scenes);

        return this._build(scenes);
    }

    protected async enterStep(
        context: Context,
        scene: Scene,
        nameOrIndex: string | number,
        options?: {
            returnToNameOrIndexOnError?: string | number;
            clearSessionOnError?: boolean;
        },
    ): Promise<void> {
        const steps = Array.isArray(scene.steps) ? scene.steps : [scene.steps];
        const step =
            typeof nameOrIndex === "number"
                ? steps[nameOrIndex]
                : steps.find((item) => item.name === nameOrIndex);

        if (!step) {
            throw new InternalServerErrorException(
                `Step with name or index "${nameOrIndex}" is not found`,
            );
        }

        const session = TelegramSessionService.getCurrentOrFail();
        const state: State = {
            scene: scene.name,
            step: step.name,
            stepIndex:
                typeof nameOrIndex === "number"
                    ? nameOrIndex
                    : steps.findIndex((item) => item.name === nameOrIndex),
            user: UserService.getCurrentOrFail(),
            payload: session.payload ?? {},
        };

        await this.saveState(state);

        try {
            let onEnter = step.onEnter ?? [];
            if (!Array.isArray(onEnter)) {
                onEnter = [onEnter];
            }

            if (!step.onEnter?.length) {
                return;
            }

            if (!(await runMiddlewares(context, onEnter, state))) {
                await this.sessionService.clearCurrent();

                return;
            }

            await this.saveState(state);
        } catch (error) {
            const commonError = CommonError.fromUnknown(error);
            this.logger.error(
                commonError.message,
                commonError.stack,
                {
                    state,
                    update: context.update,
                },
                "enterStep",
            );

            if (!options) {
                return;
            }

            const { returnToNameOrIndexOnError, ...restOptions } = options;

            if (returnToNameOrIndexOnError) {
                return this.enterStep(
                    context,
                    scene,
                    returnToNameOrIndexOnError,
                    restOptions,
                );
            }

            if (options.clearSessionOnError) {
                await this.sessionService.clearCurrent();
            }
        }
    }

    protected async saveState(state: State): Promise<void> {
        const session = TelegramSessionService.getCurrentOrFail();

        session.scene = state.scene;
        session.step = state.step;
        session.payload = state.payload ?? null;

        await this.sessionService.save(session);
    }

    protected assertScenesAreValid(scenes: Scene[]): void {
        for (const scene of scenes) {
            const steps = Array.isArray(scene.steps)
                ? scene.steps
                : [scene.steps];
            if (!steps.length) {
                throw new InternalServerErrorException(
                    `Scene "${scene.name}" has no steps`,
                );
            }

            for (const step of steps) {
                const stepIndex = steps.indexOf(step);

                if (!step.name) {
                    throw new InternalServerErrorException(
                        `Step at index "${stepIndex}" in scene "${scene.name}" has no name`,
                    );
                }
            }
        }
    }

    protected abstract _build(scenes: Scene[]): TelegrafMiddleware<Context>;
}
