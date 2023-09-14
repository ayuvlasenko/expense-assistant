import { Injectable } from "@nestjs/common";
import { Category, User } from "@prisma/client";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) {}

    async findOrCreate(name: string, user: User): Promise<Category> {
        const category = await this.findOne(name, user);

        if (category) {
            return category;
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
}
