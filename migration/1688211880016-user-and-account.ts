import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAndAccount1688211880016 implements MigrationInterface {
    name = 'UserAndAccount1688211880016'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "telegramId" text NOT NULL,
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "accounts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "name" text NOT NULL,
                "currencyId" uuid,
                "userId" uuid,
                CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "FK_e8c438e1e0bba824729f420f2e4" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "accounts"
            ADD CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "FK_3aa23c0a6d107393e8b40e3e2a6"
        `);
        await queryRunner.query(`
            ALTER TABLE "accounts" DROP CONSTRAINT "FK_e8c438e1e0bba824729f420f2e4"
        `);
        await queryRunner.query(`
            DROP TABLE "accounts"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }

}
