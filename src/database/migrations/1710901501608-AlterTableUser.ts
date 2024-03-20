import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableUser1710901501608 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN sex BIGINT,
            ADD COLUMN birthday TIMESTAMP,
            ADD COLUMN lunar_birthday TIMESTAMP,
            ADD COLUMN country VARCHAR,
            ADD COLUMN classify INT,
            ADD COLUMN genus INT,
            ADD COLUMN religion VARCHAR,
            ADD COLUMN literacy VARCHAR,
            ADD COLUMN phone VARCHAR,
            ADD COLUMN job VARCHAR,
            ADD COLUMN wor_address VARCHAR,
            ADD COLUMN father BIGINT,
            ADD COLUMN father_name VARCHAR,
            ADD COLUMN mother BIGINT,
            ADD COLUMN mother_name VARCHAR,
            ADD COLUMN spouse BiGINT,
            ADD COLUMN spouse_name VARCHAR,
            ADD COLUMN domicile VARCHAR,
            ADD COLUMN resident VARCHAR,
            ADD COLUMN description VARCHAR,
            ADD COLUMN dead_day TIMESTAMP,
            ADD COLUMN lunar_dead_day TIMESTAMP,
            ADD COLUMN patriarch INT,
            ADD COLUMN clan_id BIGINT;
        `);
  }

  public async down(): Promise<void> {}
}
