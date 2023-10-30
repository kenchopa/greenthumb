import { EventInterface } from './event.interface';

export interface EventHandlerInterface<T extends EventInterface> {
  event: string;
  handle(event: T): void;
}
