import { Context, Next } from 'koa';

import BadRequestError from '../errors/http/badRequest.error';

export default function makeCorrelationMiddleware() {
  return async (ctx: Context, next: Next) => {
    const {
      header: { 'x-correlation-id': correlationId },
    } = ctx;

    if (!correlationId) {
      throw BadRequestError.forHeader('x-correlation-id');
    }
    ctx.state.correlationId = correlationId;

    return next();
  };
}
