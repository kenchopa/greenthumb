import {
  CommandBusInterface,
  CommandHandlerInterface,
  CommandInterface,
  EventHandlerInterface,
} from '@greenthumb/core';
import logger, { LoggerInterface } from '@greenthumb/logger';
import { Container } from 'inversify';

import CreateMetricCommandHandler from './application/commands/handlers/createMetric.handler';
import MetricCreatedEventHandler from './application/events/handlers/metricCreatedHandler';
import MetricCreatedEvent from './domain/events/metricCreated.event';
import infrastructureModule from './infrastructure/infrastructure.module';
import TYPES from './types';

const initialise = async () => {
  const container = new Container();

  await container.loadAsync(infrastructureModule);

  container.bind<LoggerInterface>(TYPES.Logger).toConstantValue(logger);
  container
    .bind<EventHandlerInterface<MetricCreatedEvent>>(TYPES.Event)
    .to(MetricCreatedEventHandler);
  container
    .bind<CommandHandlerInterface<CommandInterface>>(TYPES.CommandHandler)
    .to(CreateMetricCommandHandler);

  const commandBus = container.get<CommandBusInterface>(TYPES.CommandBus);

  container
    .getAll<CommandHandlerInterface<CommandInterface>>(TYPES.CommandHandler)
    .forEach((handler: CommandHandlerInterface<CommandInterface>) => {
      commandBus.registerHandler(handler);
    });

  return container;
};

export default initialise;
