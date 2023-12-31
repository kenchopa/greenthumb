import { Token, validateToken, verifyToken } from '@greenthumb/auth';
import { UnauthorizedError } from '@greenthumb/errors';
import { Context, Next } from 'koa';

export default function makeAuthenticationMiddleware() {
  return async (ctx: Context, next: Next) => {
    const {
      header: { authorization: authorizationHeader },
    } = ctx;

    if (!authorizationHeader) {
      throw new UnauthorizedError('No authorization header found.');
    }

    try {
      const [, token] = authorizationHeader.split(' ');
      const validatedToken: Token = validateToken(token);
      verifyToken(validatedToken);

      ctx.state.token = validatedToken;
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      throw new UnauthorizedError(error.message).wrap(error);
    }

    return next();
  };
}
