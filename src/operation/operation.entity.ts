import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Account } from "~/account/account.entity";
import { BaseEntity } from "~/common/entity/base.entity";

export enum OperationType {
    INCOMING = "INCOMING",
    OUTGOING = "OUTGOING",
}

@Entity("operations")
export class Operation extends BaseEntity {
    @Column("enum", { enum: OperationType })
    type!: OperationType;

    @ManyToOne(() => Account, { eager: true })
    @Index()
    account!: Account;

    @Column("integer")
    sum!: number;

    @Column("timestamp")
    executedAt!: Date;

    constructor(
        type: OperationType,
        account: Account,
        sum: number,
        executedAt: Date,
    ) {
        super();

        this.type = type;
        this.account = account;
        this.sum = sum;
        this.executedAt = executedAt;
    }
}
