import { actionHandler, Token } from '@greenthumb/core';
import { HttpStatusCode } from '@greenthumb/errors';
import { Context } from 'koa';
import { Span } from 'opentracing';

import UserNotFoundError from '../../errors/user/userNotFound.error';
import sessionService from '../../services/session.service';
import userService from '../../services/user.service';

const sessionDeleteByIdAction = actionHandler(
  {},
  {
    controller: 'SessionController',
    operation: 'SessionDeleteByIdAction',
  },
  async (ctx: Context, span: Span) => {
    const { subject } = ctx.state.token as Token;
    if (!subject) {
      throw UserNotFoundError.forId('N/A');
    }

    const user = await userService.getById(subject, span);

    await sessionService.deleteByUser(user, span);
    ctx.status = HttpStatusCode.NO_CONTENT;
  },
);

export default sessionDeleteByIdAction;
