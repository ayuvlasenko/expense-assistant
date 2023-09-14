import { Injectable } from "@nestjs/common";
import { Prisma, TelegramSession, User } from "@prisma/client";
import { AsyncLocalStorage } from "async_hooks";
import { PrismaService } from "~/prisma/prisma.service";

export const telegramSessionStorage = new AsyncLocalStorage<TelegramSession>();

@Injectable()
export class TelegramSessionService {
    constructor(private readonly prismService: PrismaService) {}

    static getCurrentOrFail(): TelegramSession {
        const currentSession = this.getCurrent();

        if (!currentSession) {
            throw new Error("Session not found");
        }

        return currentSession;
    }

    static getCurrent(): TelegramSession | undefined {
        return telegramSessionStorage.getStore();
    }

    async clearCurrent(): Promise<void> {
        const currentSession = telegramSessionStorage.getStore();

        if (!currentSession) {
            return;
        }

        currentSession.scene = null;
        currentSession.step = null;
        currentSession.payload = null;

        await this.save(currentSession);
    }

    async find(user: User) {
        return this.prismService.telegramSession.findUnique({
            where: { userId: user.id },
            include: { user: true },
        });
    }

    async createOrUpdate(options: {
        user: User;
        scene?: string;
        step?: string;
        payload?: Record<string, unknown>;
    }) {
        const payload = options.payload
            ? ({ ...options.payload } as Prisma.InputJsonObject)
            : Prisma.JsonNull;

        return this.prismService.telegramSession.upsert({
            where: { userId: options.user.id },
            update: {
                scene: options.scene,
                step: options.step,
                payload,
            },
            create: {
                userId: options.user.id,
                scene: options.scene,
                step: options.step,
                payload,
            },
            include: { user: true },
        });
    }

    async save(session: TelegramSession) {
        const payload =
            !!session.payload && typeof session.payload === "object"
                ? ({ ...session.payload } as Prisma.InputJsonObject)
                : Prisma.DbNull;

        return this.prismService.telegramSession.update({
            where: { userId: session.userId },
            data: {
                scene: session.scene,
                step: session.step,
                payload,
            },
            include: { user: true },
        });
    }
}
