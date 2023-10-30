import { instanceToPlain, plainToInstance } from 'class-transformer';

import { EVENT_METADATA, EventMetaData } from './event.class';
import EventDescriptor from './eventDescriptor.class';
import { IEvent } from './interfaces/event.interface';

export type StorageEvent = Omit<IEvent, EventMetaData>;
export class RehydratedEvent {}

export function createEventDescriptor<T extends IEvent = IEvent>(
  event: T,
): EventDescriptor {
  const JSONEvent = instanceToPlain(event);

  for (const attribute of EVENT_METADATA) {
    delete JSONEvent[attribute];
  }

  return new EventDescriptor(
    event.aggregateId,
    event.aggregateName,
    event.eventName,
    JSONEvent,
    event.version!,
  );
}

export function rehydrateEventFromDescriptor(
  storageEvent: EventDescriptor,
): IEvent {
  const event: any = plainToInstance(RehydratedEvent, storageEvent);
  return {
    aggregateId: storageEvent.aggregateId,
    aggregateName: storageEvent.aggregateName,
    eventName: storageEvent.eventName,
    version: storageEvent.version,
    ...event.payload,
  };
}
