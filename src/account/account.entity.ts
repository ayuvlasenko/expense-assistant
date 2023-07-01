import { Column, Entity, Index, ManyToOne } from "typeorm";
import { BaseEntity } from "~/common/entity/base.entity";
import { Currency } from "~/currency/currency.entity";
import { User } from "~/user/user.entity";

@Entity("accounts")
export class Account extends BaseEntity {
    @Column("text")
    name!: string;

    @ManyToOne(() => Currency, { eager: true })
    @Index()
    currency!: Currency;

    @ManyToOne(() => User, { eager: true })
    @Index()
    user!: User;

    constructor(name: string, currency: Currency, user: User) {
        super();

        this.name = name;
        this.currency = currency;
        this.user = user;
    }
}
