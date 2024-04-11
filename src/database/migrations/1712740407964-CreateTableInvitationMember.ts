import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableInvitationMember1712740407964 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TABLE "invitation_member"(
        "id" uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
                "user_id" BIGINT NOT NULL,
                "mid" BIGINT,
                "fid" BIGINT,
                "pids" BIGINT ARRAY,
                "name" character varying,
                "gender" varchar(10),
                "clan_name" VARCHAR(255),
                "clan_id" BIGINT,
                "email" VARCHAR,
                "role_cd" INT,
                "created_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
                "updated_at" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
                "deleted_at" TIMESTAMP
    )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "invitation_member"`);
  }
}
