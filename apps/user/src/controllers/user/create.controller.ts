import {
  actionHandler,
  getRequestContext,
  Request,
  Role,
} from '@greenthumb/core';
import { HttpStatusCode } from '@greenthumb/errors';
import Joi from 'joi';
import { Context } from 'koa';
import { Span } from 'opentracing';

import UserNotAllowedToCreateError from '../../errors/user/userNotAllowedToCreate.error';
import userService from '../../services/user.service';

const userCreateAction = actionHandler(
  {
    body: Joi.object({
      email: Joi.string().email().min(3).max(255),
      firstName: Joi.string().min(1).max(128).required(),
      lastName: Joi.string().min(1).max(128).required(),
      password: Joi.string().regex(new RegExp('^[a-zA-Z0-9]{3,30}$')),
      repeatPassword: Joi.ref('password'),
      role: Joi.string().valid(Role.ADMIN, Role.OPERATOR, Role.USER),
      username: Joi.string().alphanum().min(3).max(64),
    }),
  },
  {
    controller: 'UserController',
    operation: 'UserCreateAction',
  },
  async (ctx: Context, span: Span, { body }: Request) => {
    // Anonymous actors can only create user accounts
    const { actorType } = getRequestContext();
    if (actorType === Role.ANONYMOUS && body.role !== Role.USER) {
      throw UserNotAllowedToCreateError.forRole(body.role);
    }

    const user = await userService.create(body, span);

    ctx.status = HttpStatusCode.CREATED;
    ctx.body = {
      data: user.gdpr(),
    };
  },
);

export default userCreateAction;
