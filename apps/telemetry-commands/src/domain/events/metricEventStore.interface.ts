import { EventStoreInterface } from '@greenthumb/cqrs';

import Metric from '../models/metric.model';

export interface MetricEventStoreInterface
  extends EventStoreInterface<Metric> {}
