import 'reflect-metadata';

import { EventBusInterface } from '@greenthumb/core';
import logger from '@greenthumb/logger';

import config from './config';
import initialise from './main';
import TYPES from './types';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const container = await initialise();
  logger.debug(`IoC container initialised for ${config.APP.SERVICE_NAME}...`);

  const baseEventHandler = container.get<EventBusInterface>(TYPES.EventBus);

  await baseEventHandler.subscribeEvents();
  logger.debug(`Subscribed to events for ${config.APP.SERVICE_NAME}...`);
})();
