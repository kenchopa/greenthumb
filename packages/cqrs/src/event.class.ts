import { EventInterface } from './interfaces/event.interface';

export type EventMetaData =
  | 'eventName'
  | 'aggregateName'
  | 'aggregateId'
  | 'version';

export const EVENT_METADATA = [
  'eventName',
  'aggregateName',
  'aggregateId',
  'version',
];

export abstract class Event implements EventInterface {
  public abstract eventName: string;

  public abstract aggregateName: string;

  public aggregateId: string;

  public version: number;

  constructor(aggregateId: string) {
    this.aggregateId = aggregateId;
  }
}
