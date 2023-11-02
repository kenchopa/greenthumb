import { AggregateRoot } from '@greenthumb/cqrs';

import MetricCreatedEvent from '../events/metricCreated.event';

export enum MetricType {
  MOISTURE = 'moisture',
  GROUND_TEMPERATURE = 'ground_temperature',
  WATER_TEMPERATURE = 'water_temperature',
  AIR_TEMPERATURE = 'air_temperature',
  PH = 'ph',
  HUMIDITY = 'humidity',
  LIGHT = 'light',
}

export type MoistureAttributes = {
  value: number;
  percentage: number;
  voltage: number;
  waterVolumeContent: number;
  unit: string;
};

export type GroundTemperatureAttributes = {
  value: number;
  unit: string;
};

export type WaterTemperatureAttributes = {
  value: number;
  unit: string;
};

export type AirTemperatureAttributes = {
  value: number;
  unit: string;
};

export type PhAttributes = {
  value: number;
  unit: string;
};

export type HumidityAttributes = {
  value: number;
  unit: string;
};

export type LightState = 'DARK' | 'DIM' | 'LIGHT' | 'BRIGHT' | 'BLIND';
export type LightAttributes = {
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

export class Metric extends AggregateRoot {
  private type?: MetricType;

  private attributes?: MetricAttributes;

  private createdAt?: Date;

  private updatedAt?: Date;

  constructor(id?: string, type?: MetricType, attributes?: MetricAttributes);

  constructor(id?: string, type?: MetricType, attributes?: MetricAttributes) {
    super(id);
    this.type = type;
    this.attributes = attributes;
    this.createdAt = new Date();

    if (id && type && attributes) {
      this.applyChange(
        new MetricCreatedEvent(id, type, attributes, new Date()),
      );
    }
  }

  applyMetricCreated(event: MetricCreatedEvent) {
    this.id = event.id;
    this.attributes = event.attributes;
    this.type = event.type;
    this.createdAt = event.createdAt;
  }
}
