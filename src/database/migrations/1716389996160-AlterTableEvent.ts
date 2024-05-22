import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableEvent1716389996160 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "event" ALTER COLUMN content TYPE character varying(1000)');
    await queryRunner.query('ALTER TABLE "event_comment" ALTER COLUMN content TYPE character varying(1000)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
