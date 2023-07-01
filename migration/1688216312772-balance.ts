import { MigrationInterface, QueryRunner } from "typeorm";

export class Balance1688216312772 implements MigrationInterface {
    name = 'Balance1688216312772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "balances" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "sum" integer NOT NULL,
                "accountId" uuid,
                CONSTRAINT "PK_74904758e813e401abc3d4261c2" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_badf9a6b99874218d10974e173" ON "balances" ("accountId")
        `);
        await queryRunner.query(`
            ALTER TABLE "balances"
            ADD CONSTRAINT "FK_badf9a6b99874218d10974e1735" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "balances" DROP CONSTRAINT "FK_badf9a6b99874218d10974e1735"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_badf9a6b99874218d10974e173"
        `);
        await queryRunner.query(`
            DROP TABLE "balances"
        `);
    }

}
