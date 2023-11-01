import { HttpStatusCode } from '@greenthumb/errors';
import { actionHandler, Request } from '@greenthumb/koa';
import Joi from 'joi';
import { Context } from 'koa';
import { Span } from 'opentracing';

import authService from '../../services/auth.service';

const sessionUpdateAction = actionHandler(
  {
    body: Joi.object({
      refreshToken: Joi.string().min(1).max(1024),
    }),
  },
  {
    controller: 'SessionController',
    operation: 'SessionUpdateAction',
  },
  async (ctx: Context, span: Span, { body }: Request) => {
    const { refreshToken: oldRefreshToken } = body;

    const {
      accessToken,
      accessTokenExpiredAt,
      loggedInUser,
      refreshToken,
      refreshTokenExpiredAt,
    } = await authService.refresh(oldRefreshToken, span);

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

export default sessionUpdateAction;
