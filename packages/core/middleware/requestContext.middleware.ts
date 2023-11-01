import { BadRequestError } from '@greenthumb/errors';
import { Context, Next } from 'koa';

import { setRequestContext } from '../hooks/request-context.hook';

export default function makeRequestContextMiddleware() {
  return async (ctx: Context, next: Next) => {
    const { token, correlationId } = ctx.state;
    setRequestContext({
      accessToken: token.raw,
      actorId: token.subject,
      actorType: token.role,
      correlationId,
    });

    if (!correlationId) {
      throw BadRequestError.forHeader('x-correlation-id');
    }
    ctx.state.correlationId = correlationId;

    return next();
  };
}
