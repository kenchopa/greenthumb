import { HttpStatusCode } from '@greenthumb/errors';
import { actionHandler } from '@greenthumb/koa';
import Joi from 'joi';
import { Context, DefaultState } from 'koa';
import { Span } from 'opentracing';

import authService from '../../services/auth.service';

const sessionCreateAction = actionHandler(
  {
    body: Joi.object({
      login: Joi.alternatives().try(
        Joi.string().email().min(3).max(255),
        Joi.string().alphanum().min(3).max(64),
      ),
      password: Joi.string().regex(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    }),
  },
  {
    controller: 'SessionController',
    operation: 'SessionCreateAction',
  },
  async (ctx: Context, span: Span, { body }: DefaultState) => {
    const { login, password } = body;

    const {
      loggedInUser,
      accessToken,
      accessTokenExpiredAt,
      refreshToken,
      refreshTokenExpiredAt,
    } = await authService.authenticate(login, password, span);

    ctx.status = HttpStatusCode.OK;

    ctx.body = {
      data: {
        accessToken,
        accessTokenExpiredAt,
        loggedInUser: loggedInUser.human(),
        refreshToken,
        refreshTokenExpiredAt,
      },
    };
  },
);

export default sessionCreateAction;
