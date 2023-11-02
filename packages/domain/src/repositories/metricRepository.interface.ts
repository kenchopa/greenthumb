import { RepositoryInterface } from '@greenthumb/cqrs';

import { Metric } from '../models';

export interface MetricRepositoryInterface
  extends RepositoryInterface<Metric> {}
