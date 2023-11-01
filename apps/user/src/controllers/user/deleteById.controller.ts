import { HttpStatusCode } from '@greenthumb/errors';
import { actionHandler, Request } from '@greenthumb/koa';
import Joi from 'joi';
import { Context } from 'koa';
import { Span } from 'opentracing';

import userService from '../../services/user.service';

const userDeleteByIdAction = actionHandler(
  {
    params: Joi.object({
      id: Joi.string().guid(),
    }),
  },
  {
    controller: 'UserController',
    operation: 'UserDeleteByIdAction',
  },
  async (ctx: Context, span: Span, { params }: Request) => {
    const { id } = params;
    await userService.deleteById(id, span);
    ctx.status = HttpStatusCode.NO_CONTENT;
  },
);

export default userDeleteByIdAction;
