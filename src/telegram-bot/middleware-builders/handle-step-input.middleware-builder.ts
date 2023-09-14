import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Context, MiddlewareFn as TelegrafMiddleware } from "telegraf";
import { CommonError } from "~/common/common-error";
import { DropLast, assertUnreachable } from "~/common/types";
import { UserService } from "~/user/user.service";
import {
    runBeforeHandleInputMiddlewares,
    runMiddlewares,
} from "../helpers/middlewares";
import { TelegramSessionService } from "../session/telegram-session.service";
import {
    ActionResult,
    AfterSceneState,
    HandleInputActions,
    Scene,
    State,
    Step,
} from "../types/scenes";
import { BaseSceneMiddlewareBuilder } from "./base-scene.middleware-builder";

@Injectable()
export class HandleStepInputMiddlewareBuilder extends BaseSceneMiddlewareBuilder {
    constructor(protected readonly sessionService: TelegramSessionService) {
        super(sessionService);
    }

    _build(scenes: Scene[]): TelegrafMiddleware<Context> {
        return async (context, next) => {
            const session = TelegramSessionService.getCurrent();

            if (!session.scene || !session.step) {
                return next();
            }

            const scene = scenes.find((item) => item.name === session.scene);
            if (!scene) {
                throw new InternalServerErrorException(
                    `Scene with name "${session.scene}" is not found`,
                );
            }

            const steps = Array.isArray(scene.steps)
                ? scene.steps
                : [scene.steps];
            const step = steps.find((item) => item.name === session.step);
            if (!step) {
                throw new InternalServerErrorException(
                    `Step with name "${session.step}" is not found`,
                );
            }

            const state: State = {
                scene: session.scene,
                step: session.step,
                stepIndex: steps.findIndex(
                    (item) => item.name === session.step,
                ),
                user: UserService.getCurrent(),
                payload: session.payload ?? {},
            };

            const beforeHandleInputActionResult =
                await this.runBeforeHandleInputMiddlewares(
                    context,
                    step,
                    state,
                );

            if (!beforeHandleInputActionResult) {
                return;
            }

            if (beforeHandleInputActionResult.type === "exit") {
                await this.runAfterSceneMiddlewares(context, scene, state, {
                    type: "exit",
                });
                return;
            }

            const actionResult = await this.runInputHandler(
                context,
                step,
                state,
            );

            await this.runAfterHandleInputMiddlewares(
                context,
                step,
                state,
                actionResult,
            );

            if (!actionResult) {
                return;
            }

            await this.handleStepAction(context, scene, state, actionResult);
        };
    }

    private async runBeforeHandleInputMiddlewares(
        context: Context,
        step: Step,
        state: State,
    ): Promise<
        ActionResult<Pick<HandleInputActions, "next" | "exit">> | undefined
    > {
        let beforeHandleInput = step.beforeHandleInput ?? [];
        if (!Array.isArray(beforeHandleInput)) {
            beforeHandleInput = [beforeHandleInput];
        }

        if (!beforeHandleInput.length) {
            return { type: "next" };
        }

        try {
            return await runBeforeHandleInputMiddlewares(
                context,
                beforeHandleInput,
                state,
            );
        } catch (error) {
            const commonError = CommonError.fromUnknown(error);
            this.logger.error(
                commonError.message,
                commonError.stack,
                {
                    user: UserService.getCurrent(),
                    state,
                    update: context.update,
                },
                "runBeforeHandleInputMiddlewares",
            );
        } finally {
            await this.saveState(state);
        }
    }

    private async runInputHandler(
        context: Context,
        step: Step,
        state: State,
    ): Promise<ActionResult | undefined> {
        let actionResult: ActionResult | undefined;

        try {
            const actions: HandleInputActions = {
                next: () => {
                    actionResult = { type: "next" };
                },
                back: () => {
                    actionResult = { type: "back" };
                },
                selectStep: (nameOrIndex: string | number) => {
                    actionResult = { type: "selectStep", nameOrIndex };
                },
                exit: () => {
                    actionResult = { type: "exit" };
                },
                repeat: () => {
                    actionResult = { type: "repeat" };
                },
            };

            await step.handleInput(context, actions, state);

            await this.saveState(state);

            return actionResult;
        } catch (error) {
            const commonError = CommonError.fromUnknown(error);
            this.logger.error(
                commonError.message,
                commonError.stack,
                {
                    state,
                    update: context.update,
                    actionResult,
                },
                "runInputHandler",
            );

            throw error;
        }
    }

    private async runAfterHandleInputMiddlewares(
        context: Context,
        step: Step,
        state: State,
        actionResult?: ActionResult,
    ): Promise<void> {
        let afterHandleInput = step.afterHandleInput ?? [];
        if (!Array.isArray(afterHandleInput)) {
            afterHandleInput = [afterHandleInput];
        }

        if (!afterHandleInput.length) {
            return;
        }

        const middlewares = afterHandleInput.map(
            (middleware) =>
                (...args: DropLast<Parameters<typeof middleware>>) =>
                    middleware(...args, actionResult),
        );

        try {
            await runMiddlewares(context, middlewares, state);
        } catch (error) {
            const commonError = CommonError.fromUnknown(error);
            this.logger.error(
                commonError.message,
                commonError.stack,
                {
                    state,
                    update: context.update,
                },
                "runAfterHandleInputMiddlewares",
            );
        } finally {
            await this.saveState(state);
        }
    }

    private async handleStepAction(
        context: Context,
        scene: Scene,
        state: State,
        lastStepAction: ActionResult,
    ): Promise<void> {
        switch (lastStepAction.type) {
            case "next":
                await this.handleNextStepAction(context, scene, state);
                break;
            case "selectStep":
                await this.enterStep(
                    context,
                    scene,
                    lastStepAction.nameOrIndex,
                );
                break;
            case "back":
                await this.handleBackStepAction(context, scene, state);
                break;
            case "exit":
                await this.handleExitStepAction(context, scene, state);
                break;
            case "repeat":
                await this.enterStep(context, scene, state.step);
                break;
            default:
                assertUnreachable(lastStepAction);
        }
    }

    private async handleNextStepAction(
        context: Context,
        scene: Scene,
        state: State,
    ): Promise<void> {
        const steps = Array.isArray(scene.steps) ? scene.steps : [scene.steps];
        const nextStep = steps[state.stepIndex + 1];

        if (!nextStep) {
            await this.runAfterSceneMiddlewares(context, scene, state, {
                type: "next",
            });

            return;
        }

        await this.enterStep(context, scene, nextStep.name);
    }

    private async handleBackStepAction(
        context: Context,
        scene: Scene,
        state: State,
    ): Promise<void> {
        const steps = Array.isArray(scene.steps) ? scene.steps : [scene.steps];
        const previousStep = steps[state.stepIndex - 1];

        if (!previousStep) {
            throw new InternalServerErrorException(
                "Previous step is not found",
            );
        }

        await this.enterStep(context, scene, previousStep.name);
    }

    private async handleExitStepAction(
        context: Context,
        scene: Scene,
        state: State,
    ): Promise<void> {
        await this.runAfterSceneMiddlewares(context, scene, state, {
            type: "exit",
        });
    }

    private async runAfterSceneMiddlewares(
        context: Context,
        scene: Scene,
        state: AfterSceneState,
        actionResult: ActionResult<Pick<HandleInputActions, "next" | "exit">>,
    ): Promise<void> {
        let after = scene.after ?? [];
        if (!Array.isArray(after)) {
            after = [after];
        }

        if (!after.length) {
            await this.sessionService.clearCurrent();
            return;
        }

        const middlewares = after.map(
            (middleware) =>
                (...args: DropLast<Parameters<typeof middleware>>) =>
                    middleware(...args, actionResult),
        );

        try {
            await runMiddlewares(context, middlewares, state);
        } catch (error) {
            const commonError = CommonError.fromUnknown(error);
            this.logger.error(
                commonError.message,
                commonError.stack,
                {
                    state,
                    update: context.update,
                },
                "runAfterSceneMiddlewares",
            );
        } finally {
            await this.sessionService.clearCurrent();
        }
    }
}
