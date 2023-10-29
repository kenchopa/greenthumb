import { instanceToPlain, plainToInstance } from 'class-transformer';

import { EVENT_METADATA, EventMetaData } from '../Event';
import EventDescriptor from '../EventDescriptor';
import { IEvent } from '../interfaces/IEvent';

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
    aggregateId: storageEvent.aggregateGuid,
    aggregateName: storageEvent.aggregateName,
    eventName: storageEvent.eventName,
    version: storageEvent.version,
    ...event.payload,
  };
}
