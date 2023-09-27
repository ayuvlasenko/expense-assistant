import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LimitCategory } from "@prisma/client";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class LimitService {
    constructor(private readonly prismaService: PrismaService) {}

    async accountsLimit(): Promise<number> {
        const accountsLimit = await this.prismaService.limit.findFirst({
            where: {
                category: LimitCategory.ACCOUNTS,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!accountsLimit) {
            throw new InternalServerErrorException("Accounts limit not found");
        }

        return accountsLimit.value;
    }

    async categoriesLimit(): Promise<number> {
        const categoriesLimit = await this.prismaService.limit.findFirst({
            where: {
                category: LimitCategory.CATEGORIES,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!categoriesLimit) {
            throw new InternalServerErrorException(
                "Categories limit not found",
            );
        }

        return categoriesLimit.value;
    }
}
