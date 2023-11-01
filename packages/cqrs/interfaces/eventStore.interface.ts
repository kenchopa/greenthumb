export interface EventStoreInterface<T = any> {
  saveEvents(aggregateId: string, eventHistory: T[], version: number): void;
  getEventsForAggregate(aggregateId: string): Promise<T[]>;
}
