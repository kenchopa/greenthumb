import { EventHandlerInterface } from '@greenthumb/core';
import { LoggerInterface } from '@greenthumb/logger';
import { Client } from 'cassandra-driver';
import { inject, injectable } from 'inversify';

import MetricCreatedEvent from '../../../domain/events/metricCreated.event';
import TYPES from '../../../types';

@injectable()
export default class MetricCreatedEventHandler
  implements EventHandlerInterface<MetricCreatedEvent>
{
  public event = MetricCreatedEvent.name;

  constructor(
    @inject(TYPES.CassandraDb) private readonly _cassandraClient: Client,
    @inject(TYPES.Logger) private readonly _logger: LoggerInterface,
  ) {}

  async handle(event: MetricCreatedEvent) {
    const query =
      'INSERT INTO metrics (id, type, attributes, createdAt, version) VALUES (?, ?, ?, ?)';

    await this._cassandraClient.execute(
      query,
      [event.id, event.type, event.attributes, event.createdAt, event.version],
      { prepare: true },
    );

    this._logger.debug(
      `created read model for metric ${JSON.stringify(event)}`,
    );
  }
}
