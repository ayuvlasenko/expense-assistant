import { BadRequestException } from "@nestjs/common";
import { DateTime } from "luxon";

export function parseCurrencyCode(raw: unknown): string | undefined {
    if (typeof raw !== "string" || !/^[A-z]{3}$/.test(raw.trim())) {
        return;
    }

    return raw.trim().toUpperCase();
}

const OPERATION_FIRST_LINE_REGEX =
    /^([+-]?\d+([.,]\d+)?)\s+([A-z]{3})(?:\s+([+-]?\d+([.,]\d+)?)\s+([A-z]{3}))?(?:\s+(.*))?/;

export function canParseOperation(text: string): boolean {
    const lines = text.trim().split("\n");
    const firstLine = lines.shift();

    if (!firstLine) {
        return false;
    }

    return OPERATION_FIRST_LINE_REGEX.test(firstLine);
}

export function tryParseOperation(
    text: string,
): ReturnType<typeof parseOperation> | undefined {
    try {
        return parseOperation(text);
    } catch {
        // do nothing
    }
}

export function parseOperation(text: string) {
    const lines = text.trim().split("\n");
    const firstLine = lines.shift();

    if (!firstLine) {
        throw new Error("No content in the first line");
    }

    const matches = OPERATION_FIRST_LINE_REGEX.exec(firstLine);

    if (!matches) {
        throw new Error("Invalid expense format");
    }

    const rawSum1 = matches[1] as string;
    let sum1 = parseNumber(rawSum1);
    if (sum1 === undefined) {
        throw new Error("Invalid sum format for the first operation");
    }
    if (!rawSum1.startsWith("+")) {
        sum1 = -Math.abs(sum1);
    }
    const currency1 = (matches[3] as string).toUpperCase();
    const category1 = matches[7]?.trim() ?? undefined;
    const description = lines.join("\n").trim() || undefined;

    const operations = [
        {
            sum: sum1,
            currency: currency1,
            category: category1,
            description,
        },
    ];

    if (matches[4]) {
        const rawSum2 = matches[4];
        const sum2 = parseNumber(rawSum2);
        if (sum2 === undefined) {
            throw new Error("Invalid sum format for the second operation");
        }

        const currency2 = (matches[6] as string).toUpperCase();

        operations.push({
            sum: sum2,
            currency: currency2,
            category: category1,
            description,
        });
    }

    return operations;
}

export function parseNumber(
    raw: unknown,
    precision = 14,
    scale = 2,
): number | undefined {
    if (typeof raw === "number") {
        return raw;
    }

    if (typeof raw !== "string") {
        return;
    }

    const normalized = raw.replaceAll(" ", "").replace(",", ".");

    const sumRegex = new RegExp(
        `^(-|\\+)?\\d{1,${precision - scale}}([.,]\\d{1,${scale}})?$`,
    );

    if (!sumRegex.test(normalized)) {
        return;
    }

    return Number(normalized);
}

export const DATE_FORMATS = ["dd.MM.yyyy", "dd.MM", "dd", "d"];

export function parseDate(
    raw: string,
    formats = DATE_FORMATS,
): [string, string] {
    for (const format of formats) {
        const parsed = DateTime.fromFormat(raw.replace(/\s/g, ""), format, {
            zone: "utc",
        });

        if (parsed.isValid) {
            return [parsed.toUTC().toISO() as string, format];
        }
    }

    throw new BadRequestException(`Invalid date '${raw.trim()}'`);
}
