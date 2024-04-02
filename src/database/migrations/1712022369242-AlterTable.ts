import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTable1712022369242 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user" DROP COLUMN IF EXISTS father_name, DROP COLUMN IF EXISTS mother_name, DROP COLUMN IF EXISTS spouse_name, DROP COLUMN IF EXISTS patriarch, DROP COLUMN IF EXISTS spouse_name',
    );
    await queryRunner.query('ALTER TABLE "user" RENAME COLUMN father TO father_id');
    await queryRunner.query('ALTER TABLE "user" RENAME COLUMN mother TO mother_id');
    await queryRunner.query('ALTER TABLE "user" RENAME COLUMN spouse TO partner_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" RENAME COLUMN father_id TO father');
    await queryRunner.query('ALTER TABLE "user" RENAME COLUMN mother_id TO mother');
    await queryRunner.query('ALTER TABLE "user" RENAME COLUMN partner_id TO spouse');

    await queryRunner.query(
      'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS father_name varchar(255), ADD COLUMN IF NOT EXISTS mother_name varchar(255), ADD COLUMN IF NOT EXISTS spouse_name varchar(255), ADD COLUMN IF NOT EXISTS patriarch varchar(255)',
    );
  }
}
