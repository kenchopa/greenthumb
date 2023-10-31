import { EventStoreInterface } from '@greenthumb/core';

import Metric from '../models/metric.model';

export interface MetricEventStoreInterface
  extends EventStoreInterface<Metric> {}
