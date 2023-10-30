import { IEvent } from './event.interface';

export interface IEventHandler<T extends IEvent> {
  event: string;
  handle(event: T): void;
}
