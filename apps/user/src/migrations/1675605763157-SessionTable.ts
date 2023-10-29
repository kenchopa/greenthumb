/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner } from 'typeorm';

export default class SessionTable1675605763157 implements MigrationInterface {
  name = 'SessionTable1675605763157';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accessToken" character varying(1024) NOT NULL, "accessTokenExpiredAt" TIMESTAMP WITH TIME ZONE NOT NULL, "refreshToken" character varying(1024) NOT NULL, "refreshTokenExpiredAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "UQ_69ed5ce783e0c16540f12630a00" UNIQUE ("accessToken"), CONSTRAINT "UQ_8d4c5daf230e32347f71ea7bcaa" UNIQUE ("refreshToken"), CONSTRAINT "session_unique_refresh_token" UNIQUE ("refreshToken"), CONSTRAINT "REL_3d2f174ef04fb312fdebd0ddc5" UNIQUE ("userId"), CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"',
    );
    await queryRunner.query('DROP TABLE "session"');
  }
}
