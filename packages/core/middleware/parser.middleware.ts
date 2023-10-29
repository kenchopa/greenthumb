import koaBodyParser from 'koa-bodyparser';

import BadRequestError from '../errors/http/badRequest.error';

export default function makeBodyParserMiddleware() {
  return koaBodyParser({
    onerror(err, ctx) {
      throw new BadRequestError(
        `Unable to parse the body on ${ctx.originalUrl}: ${err.message}`,
      ).wrap(err);
    },
  });
}
