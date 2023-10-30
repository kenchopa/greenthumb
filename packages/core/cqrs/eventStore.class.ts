import { injectable, unmanaged } from 'inversify';
import { Collection } from 'mongodb';

import { ConcurrencyError, NotFoundError } from '../errors';
import {
  createEventDescriptor,
  rehydrateEventFromDescriptor,
} from './event.processor';
import EventDescriptor from './eventDescriptor.class';
import { EventInterface } from './interfaces/event.interface';
import { EventBusInterface } from './interfaces/eventBus.interface';
import { EventStoreInterface } from './interfaces/eventStore.interface';

@injectable()
export default abstract class EventStore implements EventStoreInterface {
  constructor(
    @unmanaged() private readonly eventCollection: Collection,
    @unmanaged() private readonly _eventBus: EventBusInterface,
  ) {}

  async saveEvents(
    aggregateId: string,
    events: IEvent[],
    expectedVersion: number,
  ) {
    const operations: any[] = [];

    const latestEvent = await this.getLastEventDescriptor(aggregateId);

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

  async getEventsForAggregate(aggregateId: string): Promise<EventInterface[]> {
    const pipeline = [
      { $match: { aggregateId } },
      {
        $project: {
          _id: 0, // Exclude the _id field if desired
          aggregateId: '$aggregateId', // Include the aggregateId field as is
          aggregateName: '$aggregateName', // Map field from document
          eventName: '$eventName', // Map field from document
          payload: '$payload', // Map field from document
          version: '$version', // Map field from document
        },
      },
    ];

    const eventDescriptors = await this.eventCollection
      .aggregate(pipeline)
      .toArray();
    if (!eventDescriptors.length) {
      throw new NotFoundError(
        'Aggregate with the requested Guid does not exist',
      );
    }

    return eventDescriptors.map((descriptor: any) =>
      rehydrateEventFromDescriptor(descriptor as EventDescriptor),
    );
  }

  private async getLastEventDescriptor(aggregateId: string) {
    const [latestEvent] = await this.eventCollection
      .find({ aggregateId }, { sort: { _id: -1 } })
      .toArray();
    return latestEvent;
  }
}
