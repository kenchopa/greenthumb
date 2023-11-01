import { Event } from '@greenthumb/cqrs';

import type { MetricAttributes, MetricType } from '../models/metric.model';

export default class MetricCreatedEvent extends Event {
  public eventName = 'telemetry.metric.created';

  public aggregateName = 'telemetry.metric';

  public id!: string;

  public type!: MetricType;

  public attributes!: MetricAttributes;

  public createdAt!: Date;

  constructor(
    id: string,
    type: MetricType,
    attributes: MetricAttributes,
    createdAt: Date,
  ) {
    super(id);
    this.id = id;
    this.type = type;
    this.attributes = attributes;
    this.createdAt = createdAt;
  }
}
