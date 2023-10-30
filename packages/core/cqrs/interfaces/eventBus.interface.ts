import EventDescriptor from '../eventDescriptor.class';

export interface EventBus {
  publish(channel: string, event: EventDescriptor): Promise<void>;
  subscribeEvents(): Promise<void>;
}
