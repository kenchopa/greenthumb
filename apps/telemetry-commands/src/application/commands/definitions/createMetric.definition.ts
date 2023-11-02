import { Command } from '@greenthumb/cqrs';
import { MetricAttributes, MetricType } from '@greenthumb/domain';

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
