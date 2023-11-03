import { EventInterface } from './event.interface';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface EventStoreInterface<T = any> {
  saveEvents(
    aggregateId: string,
    eventHistory: EventInterface[],
    version: number,
  ): void;
  getEventsForAggregate(aggregateId: string): Promise<EventInterface[]>;
}
