import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    async findOrCreate(telegramId: string): Promise<User> {
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
