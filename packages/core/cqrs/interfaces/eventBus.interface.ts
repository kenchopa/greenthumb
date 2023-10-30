import EventDescriptor from '../eventDescriptor.class';

export interface IEventBus {
  publish(channel: string, event: EventDescriptor): Promise<void>;
  subscribeEvents(): Promise<void>;
}
