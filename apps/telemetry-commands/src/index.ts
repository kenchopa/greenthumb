import 'reflect-metadata';

import * as dotenv from 'dotenv';

import initialise from './app';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log('Hello world');
  const container = await initialise();

  /* const container = await initialise();

  const baseEventHandler = container.get<EventBusInterface>(TYPES.EventBus);

  baseEventHandler.subscribeEvents(); */
})();
