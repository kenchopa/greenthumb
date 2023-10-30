import { IEvent } from './event.interface';

export interface IEventStore<T extends IEvent = any> {
  saveEvents(aggregateId: string, eventHistory: T[], version: number): void;
  getEventsForAggregate(aggregateId: string): Promise<T[]>;
}
