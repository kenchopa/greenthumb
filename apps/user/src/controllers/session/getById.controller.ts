import { HttpStatusCode } from '@greenthumb/errors';
import { actionHandler, Request } from '@greenthumb/koa';
import Joi from 'joi';
import { Context } from 'koa';
import { Span } from 'opentracing';

import sessionService from '../../services/session.service';

const sessionGetByIdAction = actionHandler(
  {
    params: Joi.object({
      id: Joi.string().guid(),
    }),
  },
  {
    controller: 'SessionController',
    operation: 'SessionGetByIdAction',
  },
  async (ctx: Context, span: Span, { params }: Request) => {
    const { id } = params;
    const session = await sessionService.getById(id, span);
    ctx.status = HttpStatusCode.OK;
    ctx.body = {
      data: session.human(),
    };
  },
);

export default sessionGetByIdAction;
