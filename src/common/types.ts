export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
    Required<Pick<T, K>>;
export type DropFirst<T extends unknown[]> = T extends [unknown, ...infer U]
    ? U
    : never;
export type DropLast<T extends unknown[]> = T extends [...infer U, unknown]
    ? U
    : never;
export type MaybeArray<T> = T | T[];
export type MaybePromise<T> = T | Promise<T>;

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
export function isComparable(raw: unknown): raw is Date | number | string {
    return (
        typeof raw === "string" ||
        typeof raw === "number" ||
        raw instanceof Date
    );
}
export function assertUnreachable(value: never): never {
    throw new Error(`Unreachable value: ${String(value)}`);
}
