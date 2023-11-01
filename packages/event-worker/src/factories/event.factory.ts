import { Role } from '@greenthumb/auth';
import { v4 as uuidV4 } from 'uuid';

import { Event } from '../models';

type Context = {
  actorType: `${Role}`;
  actorId?: string;
  version: number;
};
type Payload = { [key: string]: unknown };
type Headers = { [key: string]: unknown };

export default function createEvent(
  routingKey: string,
  aggregateId: string,
  aggregateType: string,
  occurredOn: Date,
  payload: Payload,
  headers: Headers,
  context: Context,
) {
  const event = new Event();
  event.routingKey = routingKey;
  event.aggregateId = aggregateId;
  event.aggregateType = aggregateType;
  event.occurredOn = occurredOn;
  event.payload = JSON.stringify(payload);
  event.properties = JSON.stringify({
    contentEncoding: 'utf-8',
    contentType: 'application/json',
    headers: {
      source: process.env.SERVICE_NAME,
      ...context,
      ...headers,
    },
    messageId: uuidV4(),
    timestamp: occurredOn.valueOf(),
  });

  return event;
}
