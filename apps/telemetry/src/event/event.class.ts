import { JsonObject } from 'type-fest';

export default class Event {
  routingKey: string;

  payload: JsonObject;

  headers?: JsonObject;

  properties?: JsonObject;

  public constructor(
    routingKey: string,
    payload: JsonObject,
    headers?: JsonObject,
    properties?: JsonObject,
  ) {
    this.routingKey = routingKey;
    this.payload = payload;
    this.headers = headers;
    this.properties = properties;
  }
}
