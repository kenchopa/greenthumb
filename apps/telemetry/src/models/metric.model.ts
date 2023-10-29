import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MetricType {
  MOISTURE = 'moisture',
  GROUND_TEMPERATURE = 'ground_temperature',
  WATER_TEMPERATURE = 'water_temperature',
  AIR_TEMPERATURE = 'air_temperature',
  PH = 'ph',
  HUMIDITY = 'humidity',
  LIGHT = 'light',
}

type MoistureAttributes = {
  value: number;
  percentage: number;
  voltage: number;
  waterVolumeContent: number;
  unit: string;
};

type GroundTemperatureAttributes = {
  value: number;
  unit: string;
};

type WaterTemperatureAttributes = {
  value: number;
  unit: string;
};

type AirTemperatureAttributes = {
  value: number;
  unit: string;
};

type PhAttributes = {
  value: number;
  unit: string;
};

type HumidityAttributes = {
  value: number;
  unit: string;
};

type LightState = 'DARK' | 'DIM' | 'LIGHT' | 'BRIGHT' | 'BLIND';
type LightAttributes = {
  value: number;
  state: LightState;
};

export type MetricAttributes =
  | MoistureAttributes
  | GroundTemperatureAttributes
  | WaterTemperatureAttributes
  | AirTemperatureAttributes
  | PhAttributes
  | HumidityAttributes
  | LightAttributes;

@Entity()
export default class Metric {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ nullable: false, type: 'timestamptz' })
  createdAt!: Date;

  @Column({ enum: MetricType, nullable: false, type: 'enum' })
  type!: MetricType;

  @Column({ nullable: false, type: 'json' })
  attributes!: MetricAttributes;

  @UpdateDateColumn({ nullable: false, type: 'timestamptz' })
  updatedAt!: Date;
}
