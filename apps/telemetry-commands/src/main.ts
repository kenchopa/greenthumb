import './api/http/controllers';

import {
  CommandBusInterface,
  CommandHandlerInterface,
  CommandInterface,
  EventHandlerInterface,
} from '@greenthumb/cqrs';
import { MetricCreatedEvent } from '@greenthumb/domain';
import logger, { LoggerInterface } from '@greenthumb/logger';
import { Application, json, urlencoded } from 'express';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';

import errorHandler from './api/http/middlewares/error-handler';
import CreateMetricCommandHandler from './application/commands/handlers/createMetric.handler';
import MetricCreatedEventHandler from './application/events/handlers/metricCreatedHandler';
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

  // Register all command handlers on the command bus
  container
    .getAll<CommandHandlerInterface<CommandInterface>>(TYPES.CommandHandler)
    .forEach((handler: CommandHandlerInterface<CommandInterface>) => {
      commandBus.registerHandler(handler);
    });

  // Setup express server
  const server = new InversifyExpressServer(container);
  server.setConfig((app: Application) => {
    app.use(urlencoded({ extended: true }));
    app.use(json());
  });
  server.setErrorConfig((app: Application) => {
    app.use(errorHandler);
  });
  const apiServer = server.build();
  container.bind<Application>(TYPES.ApiServer).toConstantValue(apiServer);

  return container;
};

export default initialise;
