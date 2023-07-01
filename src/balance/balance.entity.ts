import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Account } from "~/account/account.entity";
import { BaseEntity } from "~/common/entity/base.entity";

@Entity("balances")
export class Balance extends BaseEntity {
    @ManyToOne(() => Account, { eager: true })
    @Index()
    account!: Account;

    @Column("integer")
    sum!: number;
}
