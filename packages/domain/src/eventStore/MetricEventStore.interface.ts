import { EventStoreInterface } from '@greenthumb/cqrs';

import { Metric } from '../models';

export interface MetricEventStoreInterface
  extends EventStoreInterface<Metric> {}
