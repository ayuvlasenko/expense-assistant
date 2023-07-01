import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

export abstract class Base {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @CreateDateColumn({
        type: "timestamp",
    })
    createdAt!: Date;

    @UpdateDateColumn({
        type: "timestamp",
    })
    updatedAt!: Date;
}
