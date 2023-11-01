import { EventStoreInterface } from '@greenthumb/cqrs';

import Metric from '../models/metric.model';

export interface EventStore extends EventStoreInterface<Metric> {}
