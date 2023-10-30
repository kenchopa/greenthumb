import { EventInterface } from './event.interface';

export interface EventStoreInterface<T extends EventInterface = any> {
  saveEvents(aggregateId: string, eventHistory: T[], version: number): void;
  getEventsForAggregate(aggregateId: string): Promise<T[]>;
}
