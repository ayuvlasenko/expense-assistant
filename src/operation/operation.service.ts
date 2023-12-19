import { BadRequestException, Injectable } from "@nestjs/common";
import { Account, Category, OperationType } from "@prisma/client";
import { PrismaService } from "~/prisma/prisma.service";

@Injectable()
export class OperationService {
    constructor(private readonly prismaService: PrismaService) {}

    async softDelete(operationId: string) {
        const operation = await this.prismaService.operation.findUnique({
            where: {
                id: operationId,
            },
            include: {
                account: true,
            },
        });

        if (!operation) {
            throw new BadRequestException("Operation not found");
        }

        if (operation.deletedAt) {
            return operation;
        }

        return this.prismaService.operation.update({
            where: {
                id: operation.id,
            },
            data: {
                deletedAt: new Date(),
            },
            include: {
                account: true,
            },
        });
    }

    createIncoming(
        account: Account,
        sum: number,
        executedAt: Date,
        category?: Category,
        description?: string,
    ) {
        return this.create(
            OperationType.INCOMING,
            account,
            sum,
            executedAt,
            category,
            description,
        );
    }

    createOutgoing(
        account: Account,
        sum: number,
        executedAt: Date,
        category?: Category,
        description?: string,
    ) {
        return this.create(
            OperationType.OUTGOING,
            account,
            sum,
            executedAt,
            category,
            description,
        );
    }

    createTransfer(
        fromAccount: Account,
        toAccount: Account,
        fromSum: number,
        toSum: number,
        executedAt: Date,
        category?: Category,
        description?: string,
    ) {
        return this.prismaService.$transaction([
            this.create(
                OperationType.OUTGOING,
                fromAccount,
                fromSum,
                executedAt,
                category,
                description,
            ),
            this.create(
                OperationType.INCOMING,
                toAccount,
                toSum,
                executedAt,
                category,
                description,
            ),
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
                deletedAt: null,
            },
            _sum: {
                sum: true,
            },
        });

        return result.reduce((sum, item) => {
            if (item.type === OperationType.INCOMING) {
                return sum + (item._sum.sum?.toNumber() ?? 0);
            }

            return sum - (item._sum.sum?.toNumber() ?? 0);
        }, 0);
    }

    private create(
        type: OperationType,
        account: Account,
        sum: number,
        executedAt: Date,
        category?: Category,
        description?: string,
    ) {
        if (account.deletedAt) {
            throw new BadRequestException("Account is deleted");
        }

        return this.prismaService.operation.create({
            data: {
                type,
                account: {
                    connect: {
                        id: account.id,
                    },
                },
                category: category && {
                    connect: {
                        id: category.id,
                    },
                },
                sum,
                executedAt,
                description,
            },
            include: {
                account: true,
            },
        });
    }
}
