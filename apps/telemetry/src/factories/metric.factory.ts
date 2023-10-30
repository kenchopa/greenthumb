import mapTelemetryAttributes from '../mappers/metricAttributes.mapper';
import Metric, { MetricType } from '../models/metric.model';

export default class MetricFactory {
  static create(type: MetricType, jsonString: string): Metric {
    const attributes = mapTelemetryAttributes(type, jsonString);

    const metric = new Metric();
    metric.type = type;
    metric.attributes = attributes;

    return metric;
  }
}
