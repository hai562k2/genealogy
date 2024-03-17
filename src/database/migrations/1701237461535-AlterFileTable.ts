import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterFileTable1701237461535 implements MigrationInterface {
  name = 'AlterFileTable1701240561755';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE file DROP COLUMN IF EXISTS name;
    `);
    await queryRunner.query(`
      ALTER TABLE file
      ADD COLUMN name VARCHAR(255);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE file DROP COLUMN IF EXISTS name;
    `);
  }
}
