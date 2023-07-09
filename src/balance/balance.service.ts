import { Injectable } from "@nestjs/common";
import { Account, Balance } from "@prisma/client";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class BalanceService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(account: Account, sum: number): Promise<Balance> {
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

    findOneLastByAccount(account: Account): Promise<Balance | null> {
        return this.prismaService.balance.findFirst({
            where: { account: { id: account.id } },
            orderBy: { createdAt: "desc" },
        });
    }
}
