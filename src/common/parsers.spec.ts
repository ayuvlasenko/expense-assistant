import { parseCurrencyCode, parseNumber } from "./parsers";

describe("parsers", () => {
    describe("parseNumber", () => {
        it("should return undefined for invalid input", () => {
            expect(parseNumber(undefined)).toBeUndefined();
            expect(parseNumber(null)).toBeUndefined();
            expect(parseNumber("")).toBeUndefined();
            expect(parseNumber("123.45.67")).toBeUndefined();
            expect(parseNumber("123,45,67")).toBeUndefined();
            expect(parseNumber("abc")).toBeUndefined();
            expect(parseNumber("123.000", 6, 2)).toBeUndefined();
        });

        it("should return number for valid input", () => {
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

    describe("currencyCode", () => {
        it("should return undefined for non-string inputs", () => {
            expect(parseCurrencyCode(undefined)).toBeUndefined();
            expect(parseCurrencyCode(null)).toBeUndefined();
            expect(parseCurrencyCode({})).toBeUndefined();
            expect(parseCurrencyCode([])).toBeUndefined();
            expect(parseCurrencyCode(true)).toBeUndefined();
            expect(parseCurrencyCode(123)).toBeUndefined();
        });

        it("should return undefined for invalid string inputs", () => {
            expect(parseCurrencyCode("")).toBeUndefined();
            expect(parseCurrencyCode("USD1")).toBeUndefined();
        });

        it("should return the uppercase currency code for valid string inputs", () => {
            expect(parseCurrencyCode("usd ")).toBe("USD");
            expect(parseCurrencyCode("usd")).toBe("USD");
            expect(parseCurrencyCode("eur")).toBe("EUR");
            expect(parseCurrencyCode("jpy")).toBe("JPY");
        });
    });
});
