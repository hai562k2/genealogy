import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableUserAddColumn1715010583366 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN father_name character varying, ADD COLUMN mother_name character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS father_name, DROP COLUMN IF EXISTS mother_name`);
  }
}
