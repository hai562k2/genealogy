import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableCommentFile1701936884641 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE file ALTER COLUMN name TYPE VARCHAR(255) COLLATE "ja-JP-x-icu";');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE file ALTER COLUMN name TYPE VARCHAR(255);');
  }
}
