import { Column, Entity } from "typeorm";
import { BaseEntity } from "~/common/entity/base.entity";

@Entity("currencies")
export class Currency extends BaseEntity {
    @Column("text")
    code!: string;

    constructor(code: string) {
        super();
        this.code = code;
    }
}
