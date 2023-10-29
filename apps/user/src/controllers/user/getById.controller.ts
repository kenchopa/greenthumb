import { actionHandler, HttpStatusCode, Request } from '@greenthumb/core';
import Joi from 'joi';
import { Context } from 'koa';
import { Span } from 'opentracing';

import userService from '../../services/user.service';

const userGetByIdAction = actionHandler(
  {
    params: Joi.object({
      id: Joi.string().guid(),
    }),
  },
  {
    controller: 'UserController',
    operation: 'UserGetByIdAction',
  },
  async (ctx: Context, span: Span, { params }: Request) => {
    const { id } = params;
    const user = await userService.getById(id, span);
    ctx.status = HttpStatusCode.OK;
    ctx.body = {
      data: user.human(),
    };
  },
);

export default userGetByIdAction;
