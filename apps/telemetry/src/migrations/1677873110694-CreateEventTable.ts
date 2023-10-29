/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner } from 'typeorm';

export default class CreateEventTable1677873110694
  implements MigrationInterface
{
  name = 'CreateEventTable1677873110694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "occurredOn" TIMESTAMP WITH TIME ZONE NOT NULL, "processedAt" TIMESTAMP WITH TIME ZONE, "aggregateId" character varying(255) NOT NULL, "aggregateType" character varying(255) NOT NULL, "routingKey" character varying(255) NOT NULL, "payload" character varying(4096) NOT NULL, "properties" character varying(4096) NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "event"');
  }
}
