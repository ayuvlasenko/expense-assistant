import {
    canParseOperation,
    parseCurrencyCode,
    parseNumber,
    parseOperation,
} from "./parsers";

describe("parseCurrencyCode", () => {
    it("returns undefined for non-string inputs", () => {
        expect(parseCurrencyCode(undefined)).toBeUndefined();
        expect(parseCurrencyCode(null)).toBeUndefined();
        expect(parseCurrencyCode({})).toBeUndefined();
        expect(parseCurrencyCode([])).toBeUndefined();
        expect(parseCurrencyCode(true)).toBeUndefined();
        expect(parseCurrencyCode(123)).toBeUndefined();
    });

    it("returns undefined for invalid string inputs", () => {
        expect(parseCurrencyCode("")).toBeUndefined();
        expect(parseCurrencyCode("USD1")).toBeUndefined();
    });

    it("returns the uppercase currency code for valid string inputs", () => {
        expect(parseCurrencyCode("usd ")).toBe("USD");
        expect(parseCurrencyCode("usd")).toBe("USD");
        expect(parseCurrencyCode("eur")).toBe("EUR");
        expect(parseCurrencyCode("jpy")).toBe("JPY");
    });
});

describe("parseOperation", () => {
    it("parses single operation", () => {
        const text = "20.5 usd";
        const parsed = [
            {
                sum: -20.5,
                currency: "USD",
            },
        ];

        expect(canParseOperation(text)).toBe(true);
        expect(parseOperation(text)).toEqual(parsed);
    });

    it("parses multiple operations", () => {
        const text = "20.5 usd 8000.1 amd";
        const parsed = [
            {
                sum: -20.5,
                currency: "USD",
            },
            {
                sum: 8000.1,
                currency: "AMD",
            },
        ];

        expect(canParseOperation(text)).toBe(true);
        expect(parseOperation(text)).toEqual(parsed);
    });

    it("parses category", () => {
        const text = "20 usd some category";
        const parsed = [
            {
                sum: -20,
                currency: "USD",
                category: "some category",
            },
        ];

        expect(canParseOperation(text)).toBe(true);
        expect(parseOperation(text)).toEqual(parsed);
    });

    it("parses description", () => {
        const text = "20 usd\nfirst line description\nsecond line description";
        const parsed = [
            {
                sum: -20,
                currency: "USD",
                description: "first line description\nsecond line description",
            },
        ];

        expect(canParseOperation(text)).toBe(true);
        expect(parseOperation(text)).toEqual(parsed);
    });

    it("doesn't parse other text", () => {
        const noSumText = "usd";

        expect(canParseOperation(noSumText)).toBe(false);
        expect(() => parseOperation(noSumText)).toThrow(
            "Invalid expense format",
        );

        const noCurrencyText = "20";

        expect(canParseOperation(noCurrencyText)).toBe(false);
        expect(() => parseOperation(noCurrencyText)).toThrow(
            "Invalid expense format",
        );
    });
});

describe("parseNumber", () => {
    it("returns undefined for invalid input", () => {
        expect(parseNumber(undefined)).toBeUndefined();
        expect(parseNumber(null)).toBeUndefined();
        expect(parseNumber("")).toBeUndefined();
        expect(parseNumber("123.45.67")).toBeUndefined();
        expect(parseNumber("123,45,67")).toBeUndefined();
        expect(parseNumber("abc")).toBeUndefined();
        expect(parseNumber("123.000", 6, 2)).toBeUndefined();
    });

    it("returns number for valid input", () => {
        expect(parseNumber(123.45)).toBe(123.45);
        expect(parseNumber("123.45")).toBe(123.45);
        expect(parseNumber("123,45", 10, 2)).toBe(123.45);
        expect(parseNumber("-123.45")).toBe(-123.45);
        expect(parseNumber("+123.45")).toBe(123.45);
        expect(parseNumber("   +123.45    ")).toBe(123.45);
        expect(parseNumber("- 1 2 3 . 4 5")).toBe(-123.45);
        expect(parseNumber("999999999999.99", 14, 2)).toBe(999999999999.99);
    });
});
