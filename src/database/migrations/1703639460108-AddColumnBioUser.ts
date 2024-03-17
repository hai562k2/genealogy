import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnBioUser1703639460108 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN describe TEXT;`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "photoId";`);
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN file JSONB;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN describe;`);
    await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "photoId" uuid;`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f" FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN file;`);
  }
}
