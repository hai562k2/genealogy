import { MigrationInterface, QueryRunner } from 'typeorm';

export class CollectMoneyPay1711358717985 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "collect_money" (
            "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            "clan_id" BIGINT,
            "user_id" BIGINT,
            "money" DECIMAL,
            "description" VARCHAR(255),
            "created_by" BIGINT,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            "deleted_at" TIMESTAMP DEFAULT NULL
            );
        `);

    await queryRunner.query(`
        CREATE TABLE "pay" (
            "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            "clan_id" BIGINT,
            "money" DECIMAL,
            "description" VARCHAR(255),
            "created_by" BIGINT,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            "deleted_at" TIMESTAMP DEFAULT NULL
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "collect_money"');
    await queryRunner.query('DROP TABLE IF EXISTS "pay"');
  }
}
