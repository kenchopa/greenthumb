import { Command } from '@greenthumb/core';

import {
  MetricAttributes,
  MetricType,
} from '../../../domain/models/metric.model';

export default class CreateMetricCommand extends Command {
  private type!: MetricType;

  private attributes!: MetricAttributes;

  constructor(id: string, type: MetricType, attributes: MetricAttributes) {
    super(id);
    this.type = type;
    this.attributes = attributes;
  }

  public getType(): MetricType {
    return this.type;
  }

  public getAttributes(): MetricAttributes {
    return this.attributes;
  }
}
