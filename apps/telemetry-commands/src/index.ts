import 'reflect-metadata';

import { EventBusInterface } from '@greenthumb/cqrs';
import logger from '@greenthumb/logger';
import { Application } from 'express';

import config from './config';
import initialise from './main';
import TYPES from './types';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const container = await initialise();
  logger.debug(`IoC container initialised for "${config.APP.SERVICE_NAME}".`);

  const api: Application = container.get<Application>(TYPES.ApiServer);

  // const kafkaProducer = container.get<Producer>(TYPES.KafkaProducer);
  // await kafkaProducer.connect();

  api.listen(config.APP.PORT, () =>
    console.log(
      'The application is initialised on the port %s',
      config.APP.PORT,
    ),
  );

  const baseEventHandler = container.get<EventBusInterface>(TYPES.EventBus);
  await baseEventHandler.subscribeEvents();
  logger.debug(`Subscribed to events for "${config.APP.SERVICE_NAME}".`);
})();
