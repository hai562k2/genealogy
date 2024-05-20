import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnTitle1716218891250 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "event" ADD COLUMN title VARCHAR(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
