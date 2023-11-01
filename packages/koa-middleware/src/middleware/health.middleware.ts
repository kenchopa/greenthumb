import { HttpStatusCode } from '@greenthumb/errors';
import logger from '@greenthumb/logger';
import { Context } from 'koa';
import Router from 'koa-router';

const router = new Router();

type HealthCheckResult = {
  message: string;
  status: number;
  success: boolean;
};

type HealthCheckResults = {
  [key: string]: HealthCheckResult;
};

export default function makeHealthMiddleware(
  healthChecks: Record<string, Function>,
) {
  router.get('/private/readiness', async (ctx: Context) => {
    ctx.status = HttpStatusCode.OK;

    const healthCheckResults: HealthCheckResults = {};

    const healthCheckPromises = [];
    for (const [key, value] of Object.entries(healthChecks)) {
      const healthCheck = value();
      healthCheckPromises.push(
        healthCheck
          .then(() => {
            healthCheckResults[key] = {
              message: 'OK',
              status: HttpStatusCode.OK,
              success: true,
            };
          })
          .catch(({ message }: Error) => {
            ctx.status = HttpStatusCode.SERVICE_UNAVAILABLE;
            healthCheckResults[key] = {
              message,
              status: HttpStatusCode.SERVICE_UNAVAILABLE,
              success: false,
            };
            logger.error(`Service ${key}: ${message}`);
          }),
      );
    }
    return (
      Promise.all(healthCheckPromises)
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch((/* err */) => {})
        .then(() => {
          ctx.body = healthCheckResults;
        })
    );
  });

  router.get('/private/liveness', async (ctx: Context) => {
    ctx.status = HttpStatusCode.OK;
    ctx.body = {
      message: 'OK',
      status: HttpStatusCode.OK,
      success: true,
    };
  });

  return router.routes();
}
