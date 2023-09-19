import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Currency, User } from "@prisma/client";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class AccountService {
    constructor(private readonly prismaService: PrismaService) {}

    create(name: string, currency: Currency, user: User) {
        return this.prismaService.account.create({
            data: {
                name,
                currency: {
                    connect: {
                        id: currency.id,
                    },
                },
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
            include: {
                currency: true,
                user: true,
            },
        });
    }

    update(accountId: string, data: { name?: string; currency?: Currency }) {
        if (!data.name && !data.currency) {
            throw new BadRequestException("Nothing to update");
        }

        return this.prismaService.account.update({
            where: {
                id: accountId,
            },
            data: {
                name: data.name,
                currency: data.currency
                    ? {
                          connect: {
                              id: data.currency.id,
                          },
                      }
                    : undefined,
            },
            include: {
                currency: true,
                user: true,
            },
        });
    }

    async findAll(user: User) {
        return this.prismaService.account.findMany({
            where: {
                userId: user.id,
                deletedAt: null,
            },
            include: {
                currency: true,
                user: true,
            },
        });
    }

    async softDelete(accountId: string) {
        const account = await this.prismaService.account.findUnique({
            where: {
                id: accountId,
            },
            include: {
                currency: true,
                user: true,
            },
        });

        if (!account) {
            throw new NotFoundException("Account not found");
        }

        if (account.deletedAt) {
            return account;
        }

        return this.prismaService.account.update({
            where: {
                id: account.id,
            },
            data: {
                deletedAt: new Date(),
            },
            include: {
                currency: true,
                user: true,
            },
        });
    }
}
