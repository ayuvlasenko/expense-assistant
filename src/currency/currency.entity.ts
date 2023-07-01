import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "~/common/entity/base.entity";

@Entity("currencies")
export class Currency extends BaseEntity {
    @Column("text")
    @Index("unique_currency_code", { unique: true })
    code!: string;

    constructor(code: string) {
        super();
        this.code = code;
    }
}
