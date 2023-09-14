import { Context, Telegram } from "telegraf";
import { BeforeHandleInputMiddleware, Middleware } from "../types/scenes";
import { runBeforeHandleInputMiddlewares, runMiddlewares } from "./middlewares";

describe("middlewares", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe("runMiddlewares", () => {
        it("runs all middlewares", async () => {
            const middleware1: Middleware = jest.fn((_context, next) => next());
            const middleware2: Middleware = jest.fn((_context, next) => next());
            const middleware3: Middleware = jest.fn((_context, next) => next());

            const middlewares: Middleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await runMiddlewares({} as Context, middlewares, {});

            expect(middleware1).toHaveBeenCalledTimes(1);
            expect(middleware2).toHaveBeenCalledTimes(1);
            expect(middleware3).toHaveBeenCalledTimes(1);
        });

        it("runs middlewares in order", async () => {
            const callsOrder: number[] = [];

            const middleware1: Middleware = jest.fn((_context, next) => {
                callsOrder.push(1);
                return next();
            });
            const middleware2: Middleware = jest.fn((_context, next) => {
                callsOrder.push(2);
                return next();
            });
            const middleware3: Middleware = jest.fn((_context, next) => {
                callsOrder.push(3);
                return next();
            });

            const middlewares: Middleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await runMiddlewares({} as Context, middlewares, {});

            expect(callsOrder).toEqual([1, 2, 3]);
        });

        it("runs middlewares with context, next and state", async () => {
            const context = { telegram: {} as Telegram } as Context;
            const state = { foo: "bar" };

            const middleware1: Middleware = jest.fn((_context, next) => next());
            const middleware2: Middleware = jest.fn((_context, next) => next());
            const middleware3: Middleware = jest.fn((_context, next) => next());

            const middlewares: Middleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await runMiddlewares(context, middlewares, state);

            expect(middleware1).toHaveBeenCalledWith(
                context,
                expect.any(Function),
                state,
            );
            expect(middleware2).toHaveBeenCalledWith(
                context,
                expect.any(Function),
                state,
            );
            expect(middleware3).toHaveBeenCalledWith(
                context,
                expect.any(Function),
                state,
            );
        });

        it("doesn't run next middlewares if next is not called", async () => {
            const middleware1: Middleware = jest.fn((_context, next) => next());
            const middleware2: Middleware = jest.fn();
            const middleware3: Middleware = jest.fn();

            const middlewares: Middleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await runMiddlewares({} as Context, middlewares, {});

            expect(middleware1).toHaveBeenCalledTimes(1);
            expect(middleware2).toHaveBeenCalledTimes(1);
            expect(middleware3).toHaveBeenCalledTimes(0);
        });

        it("returns true if all middlewares are executed", async () => {
            const middleware1: Middleware = jest.fn((_context, next) => next());
            const middleware2: Middleware = jest.fn((_context, next) => next());
            const middleware3: Middleware = jest.fn((_context, next) => next());

            const middlewares: Middleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            const allMiddlewaresAreExecuted = await runMiddlewares(
                {} as Context,
                middlewares,
                {},
            );

            expect(allMiddlewaresAreExecuted).toBe(true);
        });

        it("returns false if not all middlewares are executed", async () => {
            const middleware1: Middleware = jest.fn((_context, next) => next());
            const middleware2: Middleware = jest.fn();
            const middleware3: Middleware = jest.fn();

            const middlewares: Middleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            const allMiddlewaresAreExecuted = await runMiddlewares(
                {} as Context,
                middlewares,
                {},
            );

            expect(allMiddlewaresAreExecuted).toBe(false);
        });

        it("doesn't run next middlewares if previous middleware throws an error", async () => {
            const middleware1: Middleware = jest.fn(() => {
                throw new Error();
            });
            const middleware2: Middleware = jest.fn();
            const middleware3: Middleware = jest.fn();

            const middlewares: Middleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await expect(
                runMiddlewares({} as Context, middlewares, {}),
            ).rejects.toThrow();

            expect(middleware1).toHaveBeenCalledTimes(1);
            expect(middleware2).toHaveBeenCalledTimes(0);
            expect(middleware3).toHaveBeenCalledTimes(0);
        });
    });

    describe("runBeforeHandleInputMiddlewares", () => {
        it("runs all middlewares", async () => {
            const middleware1: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );
            const middleware2: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );
            const middleware3: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );

            const middlewares: BeforeHandleInputMiddleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await runBeforeHandleInputMiddlewares(
                {} as Context,
                middlewares,
                {},
            );

            expect(middleware1).toHaveBeenCalledTimes(1);
            expect(middleware2).toHaveBeenCalledTimes(1);
            expect(middleware3).toHaveBeenCalledTimes(1);
        });

        it("runs middlewares in order", async () => {
            const callsOrder: number[] = [];

            const middleware1: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => {
                    callsOrder.push(1);
                    return actions.next();
                },
            );
            const middleware2: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => {
                    callsOrder.push(2);
                    return actions.next();
                },
            );
            const middleware3: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => {
                    callsOrder.push(3);
                    return actions.next();
                },
            );

            const middlewares: BeforeHandleInputMiddleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await runBeforeHandleInputMiddlewares(
                {} as Context,
                middlewares,
                {},
            );

            expect(callsOrder).toEqual([1, 2, 3]);
        });

        it("runs middlewares with context, actions and state", async () => {
            const context = { telegram: {} as Telegram } as Context;
            const state = { foo: "bar" };

            const middleware1: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );
            const middleware2: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );
            const middleware3: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );

            const middlewares: BeforeHandleInputMiddleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await runBeforeHandleInputMiddlewares(context, middlewares, state);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const actions = expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                next: expect.any(Function),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                exit: expect.any(Function),
            });
            expect(middleware1).toHaveBeenCalledWith(context, actions, state);
            expect(middleware2).toHaveBeenCalledWith(context, actions, state);
            expect(middleware3).toHaveBeenCalledWith(context, actions, state);
        });

        it("doesn't run next middlewares if next action is not called", async () => {
            const middleware1: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );
            const middleware2: BeforeHandleInputMiddleware = jest.fn();
            const middleware3: BeforeHandleInputMiddleware = jest.fn();

            const middlewares: BeforeHandleInputMiddleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await runBeforeHandleInputMiddlewares(
                {} as Context,
                middlewares,
                {},
            );

            expect(middleware1).toHaveBeenCalledTimes(1);
            expect(middleware2).toHaveBeenCalledTimes(1);
            expect(middleware3).toHaveBeenCalledTimes(0);
        });

        it("returns next action result if all middlewares call next action", async () => {
            const middleware1: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );
            const middleware2: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );
            const middleware3: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );

            const middlewares: BeforeHandleInputMiddleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            const actionResult = await runBeforeHandleInputMiddlewares(
                {} as Context,
                middlewares,
                {},
            );

            expect(actionResult).toStrictEqual({ type: "next" });
        });

        it("returns undefined if not all middlewares call action and last action call was next", async () => {
            const middleware1: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.next(),
            );
            const middleware2: BeforeHandleInputMiddleware = jest.fn();
            const middleware3: BeforeHandleInputMiddleware = jest.fn();

            const middlewares: BeforeHandleInputMiddleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            const actionResult = await runBeforeHandleInputMiddlewares(
                {} as Context,
                middlewares,
                {},
            );

            expect(actionResult).toBeUndefined();
        });

        it("returns exit action result if middleware calls exit action", async () => {
            const middleware1: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.exit(),
            );
            const middleware2: BeforeHandleInputMiddleware = jest.fn();
            const middleware3: BeforeHandleInputMiddleware = jest.fn();

            const middlewares: BeforeHandleInputMiddleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            const actionResult = await runBeforeHandleInputMiddlewares(
                {} as Context,
                middlewares,
                {},
            );

            expect(actionResult).toStrictEqual({ type: "exit" });
        });

        it("doesn't call next middleware if exit actions is called", async () => {
            const middleware1: BeforeHandleInputMiddleware = jest.fn(
                (_context, actions) => actions.exit(),
            );
            const middleware2: BeforeHandleInputMiddleware = jest.fn();
            const middleware3: BeforeHandleInputMiddleware = jest.fn();

            const middlewares: BeforeHandleInputMiddleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await runBeforeHandleInputMiddlewares(
                {} as Context,
                middlewares,
                {},
            );

            expect(middleware2).toHaveBeenCalledTimes(0);
        });

        it("doesn't run next middlewares if previous middleware throws an error", async () => {
            const middleware1: BeforeHandleInputMiddleware = jest.fn(() => {
                throw new Error();
            });
            const middleware2: BeforeHandleInputMiddleware = jest.fn();
            const middleware3: BeforeHandleInputMiddleware = jest.fn();

            const middlewares: BeforeHandleInputMiddleware[] = [
                middleware1,
                middleware2,
                middleware3,
            ];

            await expect(
                runBeforeHandleInputMiddlewares({} as Context, middlewares, {}),
            ).rejects.toThrow();

            expect(middleware1).toHaveBeenCalledTimes(1);
            expect(middleware2).toHaveBeenCalledTimes(0);
            expect(middleware3).toHaveBeenCalledTimes(0);
        });
    });
});
