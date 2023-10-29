import { injectable, unmanaged } from 'inversify';
import { Collection } from 'mongodb';

import { ConcurrencyError, NotFoundError } from '../errors';
import EventDescriptor from './EventDescriptor';
import { IEvent } from './interfaces/IEvent';
import { IEventBus } from './interfaces/IEventBus';
import { IEventStore } from './interfaces/IEventStore';
import {
  createEventDescriptor,
  rehydrateEventFromDescriptor,
} from './utilities/EventProcessor';

@injectable()
export default abstract class EventStore implements IEventStore {
  constructor(
    @unmanaged() private readonly eventCollection: Collection,
    @unmanaged() private readonly _eventBus: IEventBus,
  ) {}

  async saveEvents(
    aggregateGuid: string,
    events: IEvent[],
    expectedVersion: number,
  ) {
    const operations: any[] = [];

    const latestEvent = await this.getLastEventDescriptor(aggregateGuid);

    if (
      latestEvent &&
      latestEvent.version !== expectedVersion &&
      expectedVersion !== -1
    ) {
      throw ConcurrencyError.create();
    }

    let i: number = expectedVersion;

    const eventPromises: Array<Promise<void>> = [];
    for (const event of events) {
      i += 1;
      event.version = i;
      const eventDescriptor = createEventDescriptor(event);
      eventPromises.push(
        this._eventBus.publish(event.aggregateName, eventDescriptor),
      );
      operations.push({ insertOne: eventDescriptor });
    }

    await Promise.all(eventPromises);

    await this.eventCollection.bulkWrite(operations);
  }

  async getEventsForAggregate(aggregateGuid: string): Promise<IEvent[]> {
    const events = await this.eventCollection.find({ aggregateGuid }).toArray();
    if (!events.length) {
      throw new NotFoundError(
        'Aggregate with the requested Guid does not exist',
      );
    }

    return events.map((eventDescriptor: EventDescriptor) =>
      rehydrateEventFromDescriptor(eventDescriptor),
    );
  }

  private async getLastEventDescriptor(aggregateGuid: string) {
    const [latestEvent] = await this.eventCollection
      .find({ aggregateGuid }, { sort: { _id: -1 } })
      .toArray();
    return latestEvent;
  }
}
