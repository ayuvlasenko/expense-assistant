import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { Currency, Prisma, User } from "@prisma/client";
import { LimitService } from "~/limit/limit.service";
import { PrismaService } from "~/prisma/prisma.service";

const accountInclude = Prisma.validator<Prisma.AccountInclude>()({
    currency: true,
    user: true,
});
export type Account = Prisma.AccountGetPayload<{
    include: typeof accountInclude;
}>;

@Injectable()
export class AccountService {
    constructor(
        private readonly limitService: LimitService,
        private readonly prismaService: PrismaService,
    ) {}

    async create(
        name: string,
        currency: Currency,
        user: User,
    ): Promise<Account> {
        if (await this.hasReachedLimit(user)) {
            throw new ForbiddenException("Accounts limit reached");
        }

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

    async hasReachedLimit(user: User): Promise<boolean> {
        const accountsLimit = await this.limitService.accountsLimit();

        const accountsCount = await this.prismaService.account.count({
            where: {
                userId: user.id,
                deletedAt: null,
            },
        });

        return accountsCount >= accountsLimit;
    }

    update(
        accountId: string,
        data: { name?: string; currency?: Currency },
    ): Promise<Account> {
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

    async findOneById(accountId: string): Promise<Account | null> {
        return this.prismaService.account.findUnique({
            where: {
                id: accountId,
            },
            include: {
                currency: true,
                user: true,
            },
        });
    }

    async findAll(user: User): Promise<Account[]> {
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

    async hasAnyAccounts(user: User): Promise<boolean> {
        return !!(await this.prismaService.account.findFirst({
            where: {
                userId: user.id,
                deletedAt: null,
            },
        }));
    }

    async findAndCount(options: {
        user: User;
        skip: number;
        take: number;
    }): Promise<[Account[], number]> {
        return this.prismaService.$transaction([
            this.prismaService.account.findMany({
                where: {
                    userId: options.user.id,
                    deletedAt: null,
                },
                include: {
                    currency: true,
                    user: true,
                },
                skip: options.skip,
                take: options.take,
                orderBy: {
                    createdAt: "desc",
                },
            }),
            this.prismaService.account.count({
                where: {
                    userId: options.user.id,
                    deletedAt: null,
                },
            }),
        ]);
    }

    async softDelete(accountId: string): Promise<Account> {
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
