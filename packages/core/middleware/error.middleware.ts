import {
  ApiProblem,
  HttpError,
  HttpStatusCode,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
} from '@greenthumb/errors';
import logger from '@greenthumb/logger';
import { Context, Next } from 'koa';

const processRequest = async (next: Next) => {
  try {
    await next();
  } catch (error) {
    // if it's a HTTP error, throw as-is
    if (error instanceof HttpError) {
      throw error;
    }

    throw new InternalServerError('Something went badly wrong').wrap(
      error as Error,
    );
  }
};

export default function makeErrorResponderMiddleware() {
  return async (ctx: Context, next: Next) => {
    const logLevel = process.env.LOG_LEVEL ?? 'error';
    const expose = logLevel === 'debug';
    const { originalUrl } = ctx;

    // show human error
    try {
      await processRequest(next);
      const status = ctx.status || HttpStatusCode.NOT_FOUND;
      if (status === HttpStatusCode.NOT_FOUND) {
        throw NotFoundError.forRoute(originalUrl);
      } else if (status === HttpStatusCode.METHOD_NOT_ALLOWED) {
        throw MethodNotAllowedError.forMethod(ctx.request.method);
      }
    } catch (error) {
      if (!(error instanceof HttpError)) {
        throw error;
      }

      const problem: ApiProblem = error.toApiProblem();
      if (process.env.DOCS_URI) {
        problem.type = process.env.DOCS_URI;
      }
      problem.instance = originalUrl;

      // stringify the data to enable Content-Type application/problem+json
      // otherwise it will be overriden by application/json
      const data = {
        ...problem.human(),
        stack: !expose ? undefined : error.stack,
      };

      ctx.type = 'application/problem+json';
      ctx.status = problem.status;
      ctx.body = JSON.stringify(data);

      logger.error(`${problem.title} occurred.`, {
        ...problem.human(),
        ...error.previous,
      });
    }
  };
}
