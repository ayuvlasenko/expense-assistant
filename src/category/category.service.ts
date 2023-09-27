import { ForbiddenException, Injectable } from "@nestjs/common";
import { Category, User } from "@prisma/client";
import { LimitService } from "~/limit/limit.service";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class CategoryService {
    constructor(
        private readonly limitService: LimitService,
        private readonly prisma: PrismaService,
    ) {}

    async create(name: string, user: User): Promise<Category> {
        if (await this.hasReachedLimit(user)) {
            throw new ForbiddenException("Categories limit reached");
        }

        return this.prisma.category.create({
            data: {
                name: name.trim(),
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });
    }

    async findOne(name: string, user: User): Promise<Category | null> {
        return this.prisma.category.findFirst({
            where: {
                name: {
                    contains: name.trim(),
                    mode: "insensitive",
                },
                user: {
                    id: user.id,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async hasReachedLimit(user: User): Promise<boolean> {
        const categoriesLimit = await this.limitService.categoriesLimit();

        const categoriesCount = await this.prisma.category.count({
            where: {
                user: {
                    id: user.id,
                },
            },
        });

        return categoriesCount >= categoriesLimit;
    }
}
