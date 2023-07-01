import { MigrationInterface, QueryRunner } from "typeorm";

export class Currency1688211684231 implements MigrationInterface {
    name = 'Currency1688211684231'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "currencies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "code" text NOT NULL,
                CONSTRAINT "PK_d528c54860c4182db13548e08c4" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "query-result-cache" (
                "id" SERIAL NOT NULL,
                "identifier" character varying,
                "time" bigint NOT NULL,
                "duration" integer NOT NULL,
                "query" text NOT NULL,
                "result" text NOT NULL,
                CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "query-result-cache"
        `);
        await queryRunner.query(`
            DROP TABLE "currencies"
        `);
    }

}
