import { BadRequestError } from '@greenthumb/errors';
import koaBodyParser from 'koa-bodyparser';

export default function makeBodyParserMiddleware() {
  return koaBodyParser({
    onerror(err, ctx) {
      throw new BadRequestError(
        `Unable to parse the body on ${ctx.originalUrl}: ${err.message}`,
      ).wrap(err);
    },
  });
}
