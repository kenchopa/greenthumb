import {
  EventBusInterface,
  EventStore,
  EventStoreInterface,
} from '@greenthumb/cqrs';
import { Metric } from '@greenthumb/domain';
import { inject, injectable } from 'inversify';
import { Db } from 'mongodb';

import TYPES from '../../types';

@injectable()
export default class MetricEventStore
  extends EventStore
  implements EventStoreInterface<Metric>
{
  constructor(
    @inject(TYPES.Db) private readonly db: Db,
    @inject(TYPES.EventBus) private readonly eventBus: EventBusInterface,
  ) {
    super(db.collection('metric-events'), eventBus);
  }
}
