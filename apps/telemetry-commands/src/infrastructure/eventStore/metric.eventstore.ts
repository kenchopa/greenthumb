import { EventBusInterface, EventStore } from '@greenthumb/cqrs';
import { inject, injectable } from 'inversify';
import { Db } from 'mongodb';

import TYPES from '../../types';

@injectable()
// todo: implement MetricEventStoreInterface
export default class MetricEventStore extends EventStore {
  constructor(
    @inject(TYPES.Db) private readonly db: Db,
    @inject(TYPES.EventBus) private readonly eventBus: EventBusInterface,
  ) {
    super(db.collection('metric-events'), eventBus);
  }
}
