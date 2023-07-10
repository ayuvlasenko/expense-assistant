import { Injectable } from "@nestjs/common";
import { Account, Operation, OperationType } from "@prisma/client";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class OperationService {
    constructor(private readonly prismaService: PrismaService) {}

    createIncoming(
        account: Account,
        sum: number,
        executedAt: Date,
    ): Promise<Operation> {
        return this.create(OperationType.INCOMING, account, sum, executedAt);
    }

    createOutgoing(
        account: Account,
        sum: number,
        executedAt: Date,
    ): Promise<Operation> {
        return this.create(OperationType.OUTGOING, account, sum, executedAt);
    }

    createTransfer(
        fromAccount: Account,
        toAccount: Account,
        fromSum: number,
        toSum: number,
        executedAt: Date,
    ): Promise<[from: Operation, to: Operation]> {
        return this.prismaService.$transaction([
            this.create(
                OperationType.OUTGOING,
                fromAccount,
                fromSum,
                executedAt,
            ),
            this.create(OperationType.INCOMING, toAccount, toSum, executedAt),
        ]);
    }

    async calculateSum(account: Account, startFrom?: Date): Promise<number> {
        const result = await this.prismaService.operation.groupBy({
            by: ["type"],
            where: {
                account: {
                    id: account.id,
                },
                executedAt: startFrom && {
                    gte: startFrom,
                },
            },
            _sum: {
                sum: true,
            },
        });

        return result.reduce((sum, item) => {
            if (item.type === OperationType.INCOMING) {
                return sum + (item._sum.sum ?? 0);
            }

            return sum - (item._sum.sum ?? 0);
        }, 0);
    }

    private create(
        type: OperationType,
        account: Account,
        sum: number,
        executedAt: Date,
    ) {
        return this.prismaService.operation.create({
            data: {
                type,
                account: {
                    connect: {
                        id: account.id,
                    },
                },
                sum,
                executedAt,
            },
            include: {
                account: true,
            },
        });
    }
}
