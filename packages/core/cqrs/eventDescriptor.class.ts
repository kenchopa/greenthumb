import type { StorageEvent } from './event.processor';
import type { IEvent } from './interfaces';

export default class EventDescriptor implements IEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly aggregateName: string,
    public readonly eventName: string,
    public readonly payload: StorageEvent,
    public readonly version: number,
  ) {}
}
