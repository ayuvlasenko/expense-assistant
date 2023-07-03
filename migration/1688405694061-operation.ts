import { MigrationInterface, QueryRunner } from "typeorm";

export class Operation1688405694061 implements MigrationInterface {
    name = 'Operation1688405694061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."operations_type_enum" AS ENUM('INCOMING', 'OUTGOING')
        `);
        await queryRunner.query(`
            CREATE TABLE "operations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "type" "public"."operations_type_enum" NOT NULL,
                "sum" integer NOT NULL,
                "executedAt" TIMESTAMP NOT NULL,
                "accountId" uuid,
                CONSTRAINT "PK_7b62d84d6f9912b975987165856" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8a3841c4df2be76a564e767322" ON "operations" ("accountId")
        `);
        await queryRunner.query(`
            ALTER TABLE "operations"
            ADD CONSTRAINT "FK_8a3841c4df2be76a564e7673227" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "operations" DROP CONSTRAINT "FK_8a3841c4df2be76a564e7673227"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8a3841c4df2be76a564e767322"
        `);
        await queryRunner.query(`
            DROP TABLE "operations"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."operations_type_enum"
        `);
    }

}
