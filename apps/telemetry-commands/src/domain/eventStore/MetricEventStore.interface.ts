import { EventStoreInterface } from '@greenthumb/core';

import Metric from '../models/metric.model';

export interface EventStore extends EventStoreInterface<Metric> {}
