import { actionHandler } from '@greenthumb/core';
import { HttpStatusCode } from '@greenthumb/errors';
import { Context } from 'koa';
import { Span } from 'opentracing';

import userService from '../../services/user.service';

const userGetAllAction = actionHandler(
  {},
  {
    controller: 'UserController',
    operation: 'UserGetAllAction',
  },
  async (ctx: Context, span: Span) => {
    const users = await userService.getAll(span);
    ctx.status = HttpStatusCode.OK;
    ctx.body = {
      data: users.map((user) => user.gdpr()),
    };
  },
);

export default userGetAllAction;
