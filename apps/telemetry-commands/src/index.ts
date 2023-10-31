import 'reflect-metadata';

import { EventBusInterface } from '@greenthumb/core';
import logger from '@greenthumb/logger';

import config from './config';
import initialise from './main';
import TYPES from './types';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  logger.debug(`Booting up container for ${config.APP.SERVICE_NAME}...`);

  const container = await initialise();

  const baseEventHandler = container.get<EventBusInterface>(TYPES.EventBus);

  await baseEventHandler.subscribeEvents();
})();
