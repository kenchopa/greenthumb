import { RepositoryInterface } from '@greenthumb/cqrs';

import Metric from '../models/metric.model';

export interface MetricRepositoryInterface
  extends RepositoryInterface<Metric> {}
