import logger from '@greenthumb/logger';
import { Context, Next } from 'koa';
import { performance } from 'perf_hooks';

export default function makeRequestLoggerMiddleware() {
  return async (ctx: Context, next: Next) => {
    const t0 = performance.now();
    await next();
    const t1 = performance.now();

    const { url, status, method } = ctx;

    const result = t1 - t0;
    const time =
      result < 10000
        ? `${Math.floor(result)}ms`
        : `${Math.floor(result / 1000)}s`;

    logger.info(`xxx ${method} ${url} ${status} ${time}`);
  };
}
