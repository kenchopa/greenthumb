/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner } from 'typeorm';

export default class CreateMetricTable1677869487553
  implements MigrationInterface
{
  name = 'CreateMetricTable1677869487553';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"public\".\"metric_type_enum\" AS ENUM('moisture', 'ground_temperature', 'water_temperature', 'air_temperature', 'ph', 'humidity', 'light')",
    );
    await queryRunner.query(
      'CREATE TABLE "metric" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."metric_type_enum" NOT NULL, "attributes" json NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d24c075ea2926dd32bd1c534ce" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "metric"');
    await queryRunner.query('DROP TYPE "public"."metric_type_enum"');
  }
}
