import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Operation, OperationType } from "./operation.entity";
import { DataSource, Repository } from "typeorm";
import { Account } from "~/account/account.entity";

@Injectable()
export class OperationService {
    constructor(
        @InjectRepository(Operation)
        private readonly operationRepository: Repository<Operation>,
        private readonly dataSource: DataSource,
    ) {}

    async createIncoming(
        account: Account,
        sum: number,
        executedAt: Date,
    ): Promise<Operation> {
        const operation = new Operation(
            OperationType.INCOMING,
            account,
            sum,
            executedAt,
        );

        return this.operationRepository.save(operation);
    }

    async createOutgoing(
        account: Account,
        sum: number,
        executedAt: Date,
    ): Promise<Operation> {
        const operation = new Operation(
            OperationType.OUTGOING,
            account,
            sum,
            executedAt,
        );

        return this.operationRepository.save(operation);
    }

    async createTransfer(
        fromAccount: Account,
        toAccount: Account,
        fromSum: number,
        toSum: number,
        executedAt: Date,
    ): Promise<[from: Operation, to: Operation]> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const fromOperation = new Operation(
                OperationType.OUTGOING,
                fromAccount,
                fromSum,
                executedAt,
            );
            const toOperation = new Operation(
                OperationType.INCOMING,
                toAccount,
                toSum,
                executedAt,
            );

            await queryRunner.manager.save(fromOperation);
            await queryRunner.manager.save(toOperation);

            await queryRunner.commitTransaction();

            return [fromOperation, toOperation];
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
