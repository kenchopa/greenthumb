import {
  EventBusInterface,
  EventDescriptor,
  EventHandlerInterface,
  EventInterface,
  rehydrateEventFromDescriptor,
} from '@greenthumb/core';
import { instanceToPlain } from 'class-transformer';
import { inject, injectable, multiInject } from 'inversify';
import { Consumer, Producer } from 'kafkajs';

import TYPES from '../../types';

@injectable()
export default class KafkaEventBus implements EventBusInterface {
  constructor(
    @multiInject(TYPES.Event)
    private readonly eventHandlers: EventHandlerInterface<EventInterface>[],
    @inject(TYPES.KafkaConsumer) private readonly _subscriber: Consumer,
    @inject(TYPES.KafkaProducer) private readonly _producer: Producer,
  ) {}

  async publish(
    channel: string,
    eventDescriptor: EventDescriptor,
  ): Promise<void> {
    const payload: string = JSON.stringify({
      ...instanceToPlain(eventDescriptor),
    });
    await this._producer.send({
      messages: [
        {
          key: eventDescriptor.aggregateId,
          value: payload,
        },
      ],
      topic: channel,
    });
  }

  async subscribeEvents(): Promise<void> {
    await this._subscriber.run({
      eachMessage: async ({ message, heartbeat }) => {
        if (message.value) {
          const eventDescriptor = JSON.parse(message.value.toString());
          const matchedHandlers: EventHandlerInterface<EventInterface>[] =
            this.eventHandlers.filter(
              (handler) => handler.event === eventDescriptor.eventName,
            );

          await Promise.all(
            matchedHandlers.map(
              (handler: EventHandlerInterface<EventInterface>) =>
                handler.handle(rehydrateEventFromDescriptor(eventDescriptor)),
            ),
          );

          await heartbeat();
        }
      },
    });
  }
}
