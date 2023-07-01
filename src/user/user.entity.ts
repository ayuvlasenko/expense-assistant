import { Column, Entity, Index, OneToMany } from "typeorm";
import { Account } from "~/account/account.entity";
import { BaseEntity } from "~/common/entity/base.entity";

@Entity("users")
export class User extends BaseEntity {
    @Column("text")
    @Index("unique_user_telegram_id", { unique: true })
    telegramId!: string;

    @OneToMany(() => Account, (account) => account.user)
    accounts?: Account[];

    constructor(telegramId: string) {
        super();
        this.telegramId = telegramId;
    }
}
