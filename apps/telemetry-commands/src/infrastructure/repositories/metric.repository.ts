import { EventSourcedRepository } from '@greenthumb/cqrs';
import {
  Metric,
  MetricEventStoreInterface,
  MetricRepositoryInterface,
} from '@greenthumb/domain';
import { inject, injectable } from 'inversify';

import TYPES from '../../types';

@injectable()
export default class MetricRepository
  extends EventSourcedRepository<Metric>
  implements MetricRepositoryInterface
{
  constructor(
    @inject(TYPES.MetricEventStore)
    private readonly eventstore: MetricEventStoreInterface,
  ) {
    super(eventstore, Metric);
  }
}
