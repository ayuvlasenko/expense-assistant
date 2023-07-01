import { MigrationInterface, QueryRunner } from "typeorm";

export class Currency1688209312332 implements MigrationInterface {
    name = 'Currency1688209312332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "currency" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "code" text NOT NULL,
                CONSTRAINT "PK_3cda65c731a6264f0e444cc9b91" PRIMARY KEY ("id")
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
            DROP TABLE "currency"
        `);
    }

}
