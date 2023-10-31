import EventDescriptor from '../eventDescriptor.class';

export interface EventBusInterface {
  publish(channel: string, event: EventDescriptor): Promise<void>;
  subscribeEvents(): Promise<void>;
}
