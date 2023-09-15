export function parseCurrencyCode(raw: unknown): string | undefined {
    if (typeof raw !== "string" || !/^[A-z]{3}$/.test(raw.trim())) {
        return;
    }

    return raw.trim().toUpperCase();
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
