import Metric from '../models/metric.model';
import Event from './event.class';

export default class MetricCreatedEvent extends Event {
  public constructor({ id, type, attributes, createdAt }: Metric) {
    super('telemetry.metric.created', {
      attributes,
      createdAt: createdAt.toISOString(),
      id,
      type,
    });
  }
}
