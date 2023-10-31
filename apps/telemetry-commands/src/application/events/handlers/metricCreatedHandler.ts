import { EventHandlerInterface } from '@greenthumb/core';
import { LoggerInterface } from '@greenthumb/logger';
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
      'INSERT INTO jobs (guid, title, description, status, version) VALUES (?, ?, ?, ?, ?)';

    await this._cassandraClient.execute(
      query,
      [event.guid, event.title, event.description, event.status, event.version],
      { prepare: true },
    );

    this._logger.info(`created read model for job ${JSON.stringify(event)}`);
  }
}
