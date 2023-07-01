import { Column, Entity } from "typeorm";
import { Base } from "~/common/entity/base.entity";

@Entity()
export class Currency extends Base {
    @Column("text")
    code!: string;

    constructor(code: string) {
        super();
        this.code = code;
    }
}
