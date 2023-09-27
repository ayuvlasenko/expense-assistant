import { BadRequestException, Injectable } from "@nestjs/common";
import { Account } from "@prisma/client";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class BalanceService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(account: Account, sum: number) {
        if (account.deletedAt) {
            throw new BadRequestException("Account is deleted");
        }

        return this.prismaService.balance.create({
            data: {
                account: {
                    connect: {
                        id: account.id,
                    },
                },
                sum,
            },
        });
    }

    findOneLastByAccount(account: Account) {
        return this.prismaService.balance.findFirst({
            where: { account: { id: account.id } },
            orderBy: { createdAt: "desc" },
        });
    }
}
