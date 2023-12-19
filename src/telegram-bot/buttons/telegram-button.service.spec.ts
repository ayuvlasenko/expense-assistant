import { TelegramButtonService } from "./telegram-button.service";

describe("telegram-button.service", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it("parses callback data with object payload", () => {
        const payload = { foo: "bar" };
        const hash = 123;

        const result = TelegramButtonService.parseCallbackButtonData(
            JSON.stringify({ h: hash, p: payload }),
        );

        expect(result).toEqual({ hash, payload });
    });

    it("parses callback data with string payload", () => {
        const payload = "foo";
        const hash = 123;

        const result = TelegramButtonService.parseCallbackButtonData(
            JSON.stringify({ h: hash, p: payload }),
        );

        expect(result).toEqual({ hash, payload });
    });
});
