import { EventSourcedRepository, EventStoreInterface } from '@greenthumb/cqrs';
import { inject, injectable } from 'inversify';

import Metric from '../../domain/models/metric.model';
import { MetricRepositoryInterface } from '../../domain/repositories/metricRepository.interface';
import TYPES from '../../types';

@injectable()
export default class MetricRepository
  extends EventSourcedRepository<Metric>
  implements MetricRepositoryInterface
{
  constructor(
    @inject(TYPES.MetricEventStore)
    private readonly eventstore: EventStoreInterface,
  ) {
    super(eventstore, Metric);
  }
}
