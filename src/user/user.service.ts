import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { AsyncLocalStorage } from "async_hooks";
import { PrismaService } from "~/prisma/prisma.service";

export const userStorage = new AsyncLocalStorage<User>();

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    static getCurrentOrFail(): User {
        const currentUser = this.getCurrent();

        if (!currentUser) {
            throw new NotFoundException("User not found");
        }

        return currentUser;
    }

    static getCurrent(): User | undefined {
        return userStorage.getStore();
    }

    async findOrCreate(telegramId: string) {
        const existingUser = await this.prismaService.user.findUnique({
            where: { telegramId },
            include: { accounts: true },
        });

        if (existingUser) {
            return existingUser;
        }

        return this.prismaService.user.create({
            data: { telegramId },
            include: { accounts: true },
        });
    }
}
