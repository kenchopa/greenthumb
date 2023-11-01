import { Role } from '@greenthumb/auth';
import { HttpStatusCode } from '@greenthumb/errors';
import { actionHandler, Request } from '@greenthumb/koa';
import Joi from 'joi';
import { Context } from 'koa';
import { Span } from 'opentracing';

import userService from '../../services/user.service';

const userUpdateAction = actionHandler(
  {
    body: Joi.object({
      email: Joi.string().email().min(3).max(255),
      firstName: Joi.string().min(1).max(128).required(),
      lastName: Joi.string().min(1).max(128).required(),
      role: Joi.string().valid(Role.ADMIN, Role.OPERATOR, Role.USER),
      username: Joi.string().alphanum().min(3).max(64),
    }),
    params: Joi.object({
      id: Joi.string().guid(),
    }),
  },
  {
    controller: 'UserController',
    operation: 'UserUpdateAction',
  },
  async (ctx: Context, span: Span, { body, params }: Request) => {
    const { id } = params;
    const user = await userService.update(
      {
        id,
        ...body,
      },
      span,
    );
    ctx.status = HttpStatusCode.OK;
    ctx.body = {
      data: user.gdpr(),
    };
  },
);

export default userUpdateAction;
