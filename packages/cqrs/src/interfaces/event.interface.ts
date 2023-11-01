import { MessageInterface } from './message.interface';

export interface EventInterface extends MessageInterface {
  eventName: string;
  aggregateName: string;
  aggregateId: string;
  version?: number;
}
