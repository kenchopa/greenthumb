import { IEvent } from './IEvent';

export interface IEventStore<T extends IEvent = any> {
  saveEvents(aggregateGuid: string, eventHistory: T[], version: number): void;
  getEventsForAggregate(aggregateGuid: string): Promise<T[]>;
}
