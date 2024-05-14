import { MigrationInterface, QueryRunner } from 'typeorm';

export class LenghtClanInformation1715704447673 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE clan ALTER column information TYPE character varying(1000)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE clan ALTER column information TYPE character varying(255)');
  }
}
