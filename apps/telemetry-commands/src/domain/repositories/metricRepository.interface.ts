import { RepositoryInterface } from '@greenthumb/core';

import Metric from '../models/metric.model';

export interface MetricRepositoryInterface
  extends RepositoryInterface<Metric> {}
