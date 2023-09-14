import { HttpException, HttpStatus } from "@nestjs/common";
import { MESSAGES } from "@nestjs/core/constants";
import { isRecord } from "./types";

interface CommonErrorData {
    code: number;
    message: string;
    stack?: string;
}

export class CommonError {
    code: number;
    message: string;
    stack: string;

    constructor(data: CommonErrorData) {
        this.code = data.code;
        this.message = data.message;
        this.stack = data.stack ?? CommonError.createStack({ removeLines: 1 });
    }

    static fromUnknown(
        error: unknown,
        defaultError = this.default({ removeStackLines: 2 }),
    ): CommonError {
        if (error instanceof HttpException) {
            return this.fromHttpException(error);
        }

        if (isRecord(error)) {
            return this.fromErrorLike(error, defaultError);
        }

        return new CommonError({
            code: defaultError.code,
            message: String(error),
            stack: defaultError.stack,
        });
    }

    static fromHttpException(exception: HttpException): CommonError {
        return new CommonError({
            code: exception.getStatus(),
            message: this.extractHttpExceptionMessage(exception),
            stack: exception.stack,
        });
    }

    static fromErrorLike(
        error: Record<string, unknown>,
        defaultError = this.default({ removeStackLines: 2 }),
    ): CommonError {
        return new CommonError({
            code: this.extractErrorLikeCode(error, defaultError),
            message: this.extractErrorLikeMessage(error, defaultError),
            stack: this.extractErrorLikeStack(error, defaultError),
        });
    }

    static default(
        options: { removeStackLines?: number } = {
            removeStackLines: 1,
        },
    ): CommonError {
        return new CommonError({
            code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
            stack: this.createStack({
                removeLines: options.removeStackLines,
            }),
        });
    }

    static createStack(options?: { removeLines?: number }): string {
        const stack = new Error().stack;
        if (!stack) {
            throw new Error("Default error has no stack");
        }

        const stackLines = stack.split("\n");
        // 1 - skip first line in stack ("Error:\n")
        // (options?.removeLines ?? 0) + 1 - second line is this function so we need +1 to remove it too
        stackLines.splice(1, (options?.removeLines ?? 0) + 1);
        return stackLines.join("\n");
    }

    private static extractHttpExceptionMessage(
        exception: HttpException,
    ): string {
        const response = exception.getResponse();
        if (!isRecord(response)) {
            return exception.message;
        }

        if (Array.isArray(response.message)) {
            return response.message.length > 0
                ? response.message.join(", ")
                : exception.message;
        }
        return String(response.message || exception.message);
    }

    private static extractErrorLikeCode(
        error: Record<string, unknown>,
        defaultError: CommonErrorData,
    ): number {
        if (typeof error.code === "number") {
            return error.code;
        }

        if (typeof error.code === "string" && !isNaN(parseInt(error.code))) {
            return parseInt(error.code);
        }

        return defaultError.code;
    }

    private static extractErrorLikeMessage(
        error: Record<string, unknown>,
        defaultError: CommonErrorData,
    ): string {
        return String(
            error.description || error.message || defaultError.message,
        );
    }

    private static extractErrorLikeStack(
        error: Record<string, unknown>,
        defaultError: CommonErrorData,
    ): string | undefined {
        return String(error.stack || defaultError.stack);
    }
}
