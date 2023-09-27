import { TelegramSession } from "@prisma/client";
import { TelegramSessionService } from "../session/telegram-session.service";
import {
    AfterHandleInputMiddleware,
    Middleware,
    Scene,
    State,
    Step,
    ActionResult,
    InputHandler,
    BeforeHandleInputMiddleware,
    AfterSceneMiddleware,
} from "../types/scenes";
import { HandleStepInputMiddlewareBuilder } from "./handle-step-input.middleware-builder";
import { Test, TestingModule } from "@nestjs/testing";
import { User, UserService } from "~/user/user.service";
import { Context } from "telegraf";

describe("handle-step-input.middleware-builder", () => {
    let moduleRef!: TestingModule;
    let handleStepInputMiddlewareBuilder!: HandleStepInputMiddlewareBuilder;
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
                HandleStepInputMiddlewareBuilder,
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

        handleStepInputMiddlewareBuilder = moduleRef.get(
            HandleStepInputMiddlewareBuilder,
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

    it("runs before handle input middlewares", async () => {
        const firstMiddleware: BeforeHandleInputMiddleware = jest.fn(
            (_context, actions) => actions.next(),
        );
        const secondMiddleware: BeforeHandleInputMiddleware = jest.fn(
            (_context, actions) => actions.next(),
        );

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.beforeHandleInput = [firstMiddleware, secondMiddleware];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = step.name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(firstMiddleware).toHaveBeenCalledTimes(1);
        expect(secondMiddleware).toHaveBeenCalledTimes(1);
    });

    it("passes state to every before handle input middleware", async () => {
        const firstMiddleware: BeforeHandleInputMiddleware = jest.fn(
            (_context, actions) => actions.next(),
        );
        const secondMiddleware: BeforeHandleInputMiddleware = jest.fn(
            (_context, actions) => actions.next(),
        );

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.beforeHandleInput = [firstMiddleware, secondMiddleware];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = step.name;
        sessionMock.stepEnteredAt = new Date();
        sessionMock.payload = {};

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(firstMiddleware).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            {
                scene: sceneMock.name,
                step: step.name,
                stepIndex: 0,
                user: userMock,
                stepEnteredAt: sessionMock.stepEnteredAt,
                payload: {},
            },
        );
        expect(secondMiddleware).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            {
                scene: sceneMock.name,
                step: step.name,
                stepIndex: 0,
                stepEnteredAt: sessionMock.stepEnteredAt,
                user: userMock,
                payload: {},
            },
        );
    });

    it("before handle input middlewares changes state", async () => {
        const firstMiddleware: BeforeHandleInputMiddleware<
            State<Record<string, unknown>>
        > = jest.fn((_context, actions, state) => {
            state.payload.firstMiddleware = "value";
            return actions.next();
        });
        const secondMiddleware: BeforeHandleInputMiddleware<
            State<Record<string, unknown>>
        > = jest.fn((_context, actions, state) => {
            state.payload.secondMiddleware = "value";
            return actions.next();
        });
        const inputHandler: InputHandler<State<Record<string, unknown>>> =
            jest.fn();

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        sessionMock.scene = sceneMock.name;
        sessionMock.step = step.name;
        sessionMock.stepEnteredAt = new Date();
        sessionMock.payload = {};
        step.beforeHandleInput = [firstMiddleware, secondMiddleware];
        step.handleInput = inputHandler as InputHandler;

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(inputHandler).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            {
                scene: sceneMock.name,
                step: step.name,
                stepIndex: 0,
                stepEnteredAt: sessionMock.stepEnteredAt,
                user: userMock,
                payload: expect.objectContaining({
                    firstMiddleware: "value",
                    secondMiddleware: "value",
                }) as Record<string, unknown>,
            },
        );
    });

    it("doens't run handle input middlewares if next is not called in before handle input middlewares", async () => {
        const firstMiddleware: BeforeHandleInputMiddleware = jest.fn(
            (_context, actions) => actions.next(),
        );
        const secondMiddleware: BeforeHandleInputMiddleware = jest.fn();
        const thirdMiddleware: BeforeHandleInputMiddleware = jest.fn();

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.beforeHandleInput = [
            firstMiddleware,
            secondMiddleware,
            thirdMiddleware,
        ];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = step.name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(firstMiddleware).toHaveBeenCalledTimes(1);
        expect(secondMiddleware).toHaveBeenCalledTimes(1);
        expect(thirdMiddleware).not.toHaveBeenCalled();
    });

    it("runs input handler after before handle input middlewares", async () => {
        const middleware: BeforeHandleInputMiddleware = jest.fn(
            (_context, actions) => actions.next(),
        );
        const inputHandler: InputHandler = jest.fn();

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.beforeHandleInput = [middleware];
        step.handleInput = inputHandler;

        sessionMock.scene = sceneMock.name;
        sessionMock.step = step.name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(inputHandler).toHaveBeenCalledTimes(1);
    });

    it("doesn't run input handler if before handle input middlewares call exit action", async () => {
        const inputHandler: InputHandler = jest.fn();
        const beforeHandleInputMiddleware: BeforeHandleInputMiddleware =
            jest.fn((_context, actions) => actions.exit());

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.handleInput = inputHandler;
        step.beforeHandleInput = [beforeHandleInputMiddleware];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = step.name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(inputHandler).not.toHaveBeenCalled();
    });

    it("runs all after handle input middlewares after input handler", async () => {
        const inputHandler: InputHandler = jest.fn();
        const firstMiddleware: AfterHandleInputMiddleware = jest.fn(
            (_context, next) => next(),
        );
        const secondMiddleware: AfterHandleInputMiddleware = jest.fn(
            (_context, next) => next(),
        );

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.handleInput = inputHandler;
        step.afterHandleInput = [firstMiddleware, secondMiddleware];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = step.name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(firstMiddleware).toHaveBeenCalledTimes(1);
        expect(secondMiddleware).toHaveBeenCalledTimes(1);
    });

    const actionResults: ActionResult[] = [
        { type: "next" },
        { type: "back" },
        { type: "selectStep", nameOrIndex: 0 },
        { type: "exit" },
        { type: "repeat" },
    ];

    actionResults.forEach((actionResult) => {
        it(`passes ${actionResult.type} action result to after handle input middlewares`, async () => {
            const inputHandler: InputHandler = jest.fn((_context, actions) => {
                if (actionResult.type === "selectStep") {
                    return actions[actionResult.type](actionResult.nameOrIndex);
                }

                return actions[actionResult.type]();
            });
            const firstMiddleware: AfterHandleInputMiddleware = jest.fn(
                (_context, next) => next(),
            );
            const secondMiddleware: AfterHandleInputMiddleware = jest.fn();

            sceneMock.steps = [
                { name: "step1", handleInput: jest.fn() },
                {
                    name: "step2",
                    handleInput: inputHandler,
                    afterHandleInput: [firstMiddleware, secondMiddleware],
                },
            ];

            sessionMock.scene = sceneMock.name;
            sessionMock.step = (sceneMock.steps[1] as Step).name;
            sessionMock.stepEnteredAt = new Date();

            const handleInputMiddleware =
                handleStepInputMiddlewareBuilder.build([sceneMock]);
            await handleInputMiddleware({} as Context, jest.fn());

            expect(firstMiddleware).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                expect.anything(),
                actionResult,
            );
            expect(secondMiddleware).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                expect.anything(),
                actionResult,
            );
        });
    });

    it("enters next step if input handler returns next action result", async () => {
        const inputHandler: InputHandler = jest.fn((_context, actions) =>
            actions.next(),
        );
        const onNextStepEnter: Middleware = jest.fn();

        sceneMock.steps = [
            { name: "step1", handleInput: inputHandler },
            {
                name: "step2",
                onEnter: [onNextStepEnter],
                handleInput: jest.fn(),
            },
        ];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = (sceneMock.steps[0] as Step).name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(onNextStepEnter).toHaveBeenCalledTimes(1);
    });

    it("enters previous step if input handler returns back action result", async () => {
        const inputHandler: InputHandler = jest.fn((_context, actions) =>
            actions.back(),
        );
        const onPreviousStepEnter: Middleware = jest.fn();

        sceneMock.steps = [
            {
                name: "step1",

                onEnter: [onPreviousStepEnter],
                handleInput: jest.fn(),
            },
            {
                name: "step2",
                handleInput: inputHandler,
            },
        ];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = (sceneMock.steps[1] as Step).name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(onPreviousStepEnter).toHaveBeenCalledTimes(1);
    });

    it("enters selected step if input handler returns selectStep action result", async () => {
        const inputHandler: InputHandler = jest.fn((_context, actions) =>
            actions.selectStep("step1"),
        );
        const onSelectedStepEnter: Middleware = jest.fn();

        sceneMock.steps = [
            {
                name: "step1",
                onEnter: [onSelectedStepEnter],
                handleInput: jest.fn(),
            },
            {
                name: "step2",
                handleInput: inputHandler,
            },
        ];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = (sceneMock.steps[1] as Step).name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(onSelectedStepEnter).toHaveBeenCalledTimes(1);
    });

    it("enters same step if input handler returns repeat action result", async () => {
        const inputHandler: InputHandler = jest.fn((_context, actions) =>
            actions.repeat(),
        );
        const onSameStepEnter: Middleware = jest.fn();

        sceneMock.steps = [
            {
                name: "step1",
                onEnter: [onSameStepEnter],
                handleInput: inputHandler,
            },
        ];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = (sceneMock.steps[0] as Step).name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(onSameStepEnter).toHaveBeenCalledTimes(1);
    });

    it("exits scene if input handler returns exit action result", async () => {
        const inputHandler: InputHandler = jest.fn((_context, actions) =>
            actions.exit(),
        );
        const onSceneExit: AfterSceneMiddleware = jest.fn();

        sceneMock.steps = [
            {
                name: "step1",
                handleInput: inputHandler,
            },
        ];
        sceneMock.after = [onSceneExit];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = (sceneMock.steps[0] as Step).name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(onSceneExit).toHaveBeenCalledTimes(1);
    });

    it("exits scene if input handler returns next action result and there are no more steps", async () => {
        const inputHandler: InputHandler = jest.fn((_context, actions) =>
            actions.next(),
        );
        const onSceneExit: AfterSceneMiddleware = jest.fn();

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.handleInput = inputHandler;
        sceneMock.after = [onSceneExit];

        sessionMock.scene = sceneMock.name;
        sessionMock.step = step.name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(onSceneExit).toHaveBeenCalledTimes(1);
    });

    it("clears session if input handler returns exit action result", async () => {
        const inputHandler: InputHandler = jest.fn((_context, actions) =>
            actions.exit(),
        );
        const clearCurrentSpy = jest.spyOn(
            telegramSessionService,
            "clearCurrent",
        );

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.handleInput = inputHandler;

        sessionMock.scene = sceneMock.name;
        sessionMock.step = step.name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(clearCurrentSpy).toHaveBeenCalledTimes(1);
    });

    it("clears session if input handler returns next action and there are no more steps", async () => {
        const inputHandler: InputHandler = jest.fn((_context, actions) =>
            actions.next(),
        );
        const clearCurrentSpy = jest.spyOn(
            telegramSessionService,
            "clearCurrent",
        );

        const step = Array.isArray(sceneMock.steps)
            ? (sceneMock.steps[0] as Step)
            : sceneMock.steps;
        step.handleInput = inputHandler;

        sessionMock.scene = sceneMock.name;
        sessionMock.step = step.name;
        sessionMock.stepEnteredAt = new Date();

        const handleInputMiddleware = handleStepInputMiddlewareBuilder.build([
            sceneMock,
        ]);
        await handleInputMiddleware({} as Context, jest.fn());

        expect(clearCurrentSpy).toHaveBeenCalledTimes(1);
    });
});
