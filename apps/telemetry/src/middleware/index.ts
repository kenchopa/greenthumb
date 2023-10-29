import { makeAuthenticationMiddleware } from '@greenthumb/auth';
import {
  makeBodyParserMiddleware,
  makeCorrelationMiddleware,
  makeCorsMiddleware,
  makeErrorResponderMiddleware,
  makeHealthMiddleware,
  makeQueryStringMiddleware,
  makeRequestLoggerMiddleware,
  makeRouter,
  makeSecurityHeadersMiddleware,
  makeValidateMiddleware,
} from '@greenthumb/core';
import logger from '@greenthumb/logger';
import Koa from 'koa';

import { checkDefaultDatabase } from '../database';
import routes from '../routes';

export default function initializeMiddleware(app: Koa) {
  const router = makeRouter(routes);

  makeQueryStringMiddleware(app);

  app.use(makeCorsMiddleware());
  app.use(makeRequestLoggerMiddleware());
  app.use(makeErrorResponderMiddleware());
  app.use(makeBodyParserMiddleware());
  app.use(makeSecurityHeadersMiddleware());
  app.use(makeValidateMiddleware());
  app.use(makeHealthMiddleware({ database: checkDefaultDatabase }));
  app.use(makeCorrelationMiddleware());
  app.use(makeAuthenticationMiddleware());
  app.use(router.routes());
  app.use(router.allowedMethods());

  logger.info('Middleware initialized.');
}
