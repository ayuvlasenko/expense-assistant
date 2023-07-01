import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1688214070382 implements MigrationInterface {
    name = 'AddIndexes1688214070382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE UNIQUE INDEX "unique_currency_code" ON "currencies" ("code")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "unique_user_telegram_id" ON "users" ("telegramId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e8c438e1e0bba824729f420f2e" ON "accounts" ("currencyId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3aa23c0a6d107393e8b40e3e2a" ON "accounts" ("userId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3aa23c0a6d107393e8b40e3e2a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e8c438e1e0bba824729f420f2e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."unique_user_telegram_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."unique_currency_code"
        `);
    }

}
