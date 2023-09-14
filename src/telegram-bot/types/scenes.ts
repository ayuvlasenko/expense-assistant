import { User } from "@prisma/client";
import { Context } from "telegraf";
import { MaybeArray, MaybePromise } from "~/common/types";

export interface Scene<TPayload = unknown> {
    name: string;
    shouldBeUsed: (context: Context) => MaybePromise<boolean>;
    command?: Command;
    before?: MaybeArray<Middleware<BeforeSceneState>>;
    steps: MaybeArray<Step<TPayload>>;
    after?: MaybeArray<AfterSceneMiddleware<AfterSceneState<TPayload>>>;
}

export interface Command {
    command: string;
    description: string;
}

export type BeforeSceneState = Pick<State, "user">;

export interface Step<TPayload = unknown> {
    name: string;
    onEnter?: MaybeArray<Middleware<State<TPayload>>>;
    beforeHandleInput?: MaybeArray<
        BeforeHandleInputMiddleware<State<TPayload>>
    >;
    handleInput: InputHandler<State<TPayload>>;
    afterHandleInput?: MaybeArray<AfterHandleInputMiddleware<State<TPayload>>>;
}

export type BeforeHandleInputMiddleware<TState = unknown> = (
    context: Context,
    actions: BeforeHandleInputActions,
    state: TState,
) => MaybePromise<void>;

export interface BeforeHandleInputActions {
    next: () => MaybePromise<void>;
    exit: () => MaybePromise<void>;
}

export interface State<TPayload = unknown> {
    scene: string;
    step: string;
    stepIndex: number;
    user: User;
    payload: Partial<TPayload>;
}

export type InputHandler<TState = unknown> = (
    context: Context,
    actions: HandleInputActions,
    state: TState,
) => Promise<void> | void;

export interface HandleInputActions extends BeforeHandleInputActions {
    back: () => MaybePromise<void>;
    selectStep: (nameOrIndex: string | number) => MaybePromise<void>;
    repeat: () => MaybePromise<void>;
}

export type AfterHandleInputMiddleware<TState = unknown> = (
    context: Context,
    next: () => MaybePromise<void>,
    state: TState,
    actionResult: ActionResult | undefined,
) => MaybePromise<void>;

export type ActionResult<
    T = HandleInputActions,
    K = keyof T,
> = K extends infer U
    ? U extends "selectStep"
        ? {
              type: "selectStep";
              nameOrIndex: string | number;
          }
        : {
              type: U;
          }
    : never;

export type AfterSceneMiddleware<TState = unknown> = (
    context: Context,
    next: () => MaybePromise<void>,
    state: TState,
    actionResult: ActionResult<BeforeHandleInputActions>,
) => MaybePromise<void>;

export type AfterSceneState<TPayload = unknown> = Pick<
    State<TPayload>,
    "user" | "payload"
>;

export type Middleware<TState = unknown> = (
    context: Context,
    next: () => MaybePromise<void>,
    state: TState,
) => MaybePromise<void>;
