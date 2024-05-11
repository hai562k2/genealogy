import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableUser1710901501608 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN gender BIGINT,
            ADD COLUMN birthday TIMESTAMP,
            ADD COLUMN lunar_birthday TIMESTAMP,
            ADD COLUMN country VARCHAR,
            ADD COLUMN phone VARCHAR,
            ADD COLUMN job VARCHAR,
            ADD COLUMN wor_address VARCHAR,
            ADD COLUMN father BIGINT,
            ADD COLUMN father_name VARCHAR,
            ADD COLUMN mother BIGINT,
            ADD COLUMN mother_name VARCHAR,
            ADD COLUMN spouse BIGINT ARRAY,
            ADD COLUMN spouse_name VARCHAR,
            ADD COLUMN description VARCHAR,
            ADD COLUMN dead_day TIMESTAMP,
            ADD COLUMN lunar_dead_day TIMESTAMP,
            ADD COLUMN patriarch INT
        `);
  }

  public async down(): Promise<void> {}
}
