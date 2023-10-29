/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner } from 'typeorm';

export default class UserTable1674900215643 implements MigrationInterface {
  name = 'UserTable1674900215643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"public\".\"user_role_enum\" AS ENUM('admin', 'anonymous', 'system', 'operator', 'user')",
    );
    await queryRunner.query(
      'CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "username" character varying(64) NOT NULL, "password" character varying(512) NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT \'user\', "firstName" character varying(128), "lastName" character varying(128), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "user_unique_username" UNIQUE ("username"), CONSTRAINT "user_unique_email" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "user"');
    await queryRunner.query('DROP TYPE "public"."user_role_enum"');
  }
}
