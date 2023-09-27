import { Test, TestingModule } from "@nestjs/testing";
import { TelegramSession } from "@prisma/client";
import { Middleware, Scene, Step } from "../types/scenes";
import { TelegramSessionService } from "../session/telegram-session.service";
import { EnterSceneMiddlewareBuilder } from "./enter-scene.middleware-builder";
import { Context } from "telegraf";
import { User, UserService } from "~/user/user.service";

describe("enter-scene.middleware-builder", () => {
    let moduleRef: TestingModule;
    let enterSceneMiddlewareBuilder!: EnterSceneMiddlewareBuilder;
    let telegramSessionService!: TelegramSessionService;

    let sessionMock: TelegramSession;
    let userMock: User;
    let sceneMock: Scene;

    beforeEach(async () => {
        jest.resetModules();

        sessionMock = {
            id: "id",
            scene: null,
            step: null,
            payload: null,
            userId: "userId",
            updatedAt: new Date(),
            createdAt: new Date(),
        } as TelegramSession;
        userMock = { id: "userId" } as User;
        sceneMock = {
            name: "scene",
            shouldBeUsed: jest.fn().mockReturnValue(true),
            before: [],
            steps: [{ name: "step", handleInput: jest.fn() }],
        };

        moduleRef = await Test.createTestingModule({
            providers: [
                EnterSceneMiddlewareBuilder,
                {
                    provide: TelegramSessionService,
                    useValue: {
                        save: (session: TelegramSession) =>
                            Promise.resolve(session),
                        clearCurrent: () => Promise.resolve(),
                    },
                },
            ],
        }).compile();

        moduleRef.useLogger(false);

        await moduleRef.init();

        enterSceneMiddlewareBuilder = moduleRef.get(
            EnterSceneMiddlewareBuilder,
        );
        telegramSessionService = moduleRef.get(TelegramSessionService);

        jest.spyOn(TelegramSessionService, "getCurrent").mockReturnValue(
            sessionMock,
        );
        jest.spyOn(UserService, "getCurrent").mockReturnValue(userMock);
    });

    afterEach(async () => {
        await moduleRef.close();

        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it("runs all before scene middlewares", async () => {
        const firstMiddleware: Middleware = jest.fn((_context, next) => next());
        const secondMiddleware: Middleware = jest.fn((_context, next) =>
            next(),
        );

        sceneMock.before = [firstMiddleware, secondMiddleware];

        const enterSceneMiddleware = enterSceneMiddlewareBuilder.build([
            sceneMock,
        ]);
        await enterSceneMiddleware({} as Context, jest.fn());

        expect(sceneMock.shouldBeUsed).toHaveBeenCalledTimes(1);
        expect(firstMiddleware).toHaveBeenCalledTimes(1);
        expect(secondMiddleware).toHaveBeenCalledTimes(1);
    });

    it("doesn't run before scene middlewares if scene is already set", async () => {
        sessionMock.scene = "scene";

        const firstMiddleware: Middleware = jest.fn((_context, next) => next());
        const secondMiddleware: Middleware = jest.fn((_context, next) =>
            next(),
        );

        sceneMock.before = [firstMiddleware, secondMiddleware];

        const enterSceneMiddleware = enterSceneMiddlewareBuilder.build([
            sceneMock,
        ]);
        await enterSceneMiddleware({} as Context, jest.fn());

        expect(sceneMock.shouldBeUsed).not.toHaveBeenCalled();
        expect(firstMiddleware).not.toHaveBeenCalled();
        expect(secondMiddleware).not.toHaveBeenCalled();
    });

    it("passes context and state to every before scene middlewares", async () => {
        const firstMiddleware: Middleware = jest.fn((_context, next) => next());
        const secondMiddleware: Middleware = jest.fn((_context, next) =>
            next(),
        );

        sceneMock.before = [firstMiddleware, secondMiddleware];

        const enterSceneMiddleware = enterSceneMiddlewareBuilder.build([
            sceneMock,
        ]);
        await enterSceneMiddleware({} as Context, jest.fn());

        expect(firstMiddleware).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                user: userMock,
            }),
        );
        expect(secondMiddleware).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                user: userMock,
            }),
        );
    });

    it("sets scene, step and payload to session", async () => {
        const saveSessionSpy = jest.spyOn(telegramSessionService, "save");

        sceneMock.before = [jest.fn((_context, next) => next())];

        const enterSceneMiddleware = enterSceneMiddlewareBuilder.build([
            sceneMock,
        ]);
        await enterSceneMiddleware({} as Context, jest.fn());

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        expect(saveSessionSpy).toHaveBeenCalledWith({
            ...sessionMock,
            scene: sceneMock.name,
            step: step.name,
            payload: {},
        });
    });

    it("doesn't run onEnter first step middlewares if next is not called in before scene middlewares", async () => {
        const beforeMiddleware: Middleware = jest.fn();
        const onEnterMiddleware: Middleware = jest.fn();

        sceneMock.before = [beforeMiddleware];
        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.onEnter = [onEnterMiddleware];

        const enterSceneMiddleware = enterSceneMiddlewareBuilder.build([
            sceneMock,
        ]);
        await enterSceneMiddleware({} as Context, jest.fn());

        expect(beforeMiddleware).toHaveBeenCalledTimes(1);
        expect(onEnterMiddleware).not.toHaveBeenCalled();
    });

    it("runs onEnter middlewares of first step", async () => {
        const firstOnEnterMiddleware: Middleware = jest.fn((_context, next) =>
            next(),
        );
        const secondOnEnterMiddleware: Middleware = jest.fn((_context, next) =>
            next(),
        );

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.onEnter = [firstOnEnterMiddleware, secondOnEnterMiddleware];

        const enterSceneMiddleware = enterSceneMiddlewareBuilder.build([
            sceneMock,
        ]);
        await enterSceneMiddleware({} as Context, jest.fn());

        expect(firstOnEnterMiddleware).toHaveBeenCalledTimes(1);
        expect(secondOnEnterMiddleware).toHaveBeenCalledTimes(1);
    });

    it("clears session if onEnter first step middleware throws an error", async () => {
        const onEnterMiddleware: Middleware = jest.fn(() => {
            throw new Error();
        });

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.onEnter = [onEnterMiddleware];

        const clearCurrentSpy = jest.spyOn(
            telegramSessionService,
            "clearCurrent",
        );

        const enterSceneMiddleware = enterSceneMiddlewareBuilder.build([
            sceneMock,
        ]);
        await enterSceneMiddleware({} as Context, jest.fn());

        expect(clearCurrentSpy).toHaveBeenCalledTimes(1);
    });

    it("clears session if onEnter first step middleware doesn't call next", async () => {
        const onEnterMiddleware: Middleware = jest.fn();

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.onEnter = [onEnterMiddleware];

        const clearCurrentSpy = jest.spyOn(
            telegramSessionService,
            "clearCurrent",
        );

        const enterSceneMiddleware = enterSceneMiddlewareBuilder.build([
            sceneMock,
        ]);
        await enterSceneMiddleware({} as Context, jest.fn());

        expect(clearCurrentSpy).toHaveBeenCalledTimes(1);
    });

    it("passes state to onEnter every first step middlewares", async () => {
        const firstOnEnterMiddleware: Middleware = jest.fn((_context, next) =>
            next(),
        );
        const secondOnEnterMiddleware: Middleware = jest.fn((_context, next) =>
            next(),
        );

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.onEnter = [firstOnEnterMiddleware, secondOnEnterMiddleware];

        const context = {} as Context;

        const enterSceneMiddleware = enterSceneMiddlewareBuilder.build([
            sceneMock,
        ]);
        await enterSceneMiddleware({} as Context, jest.fn());

        expect(firstOnEnterMiddleware).toHaveBeenCalledWith(
            context,
            expect.anything(),
            {
                scene: sceneMock.name,
                step: step.name,
                stepIndex: 0,
                stepEnteredAt: expect.any(Date),
                user: userMock,
                payload: {},
            },
        );
        expect(secondOnEnterMiddleware).toHaveBeenCalledWith(
            context,
            expect.anything(),
            {
                scene: sceneMock.name,
                step: step.name,
                stepIndex: 0,
                stepEnteredAt: expect.any(Date),
                user: userMock,
                payload: {},
            },
        );
    });
});
