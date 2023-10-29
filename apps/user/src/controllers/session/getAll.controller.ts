import { actionHandler } from '@greenthumb/core';
import { Context } from 'koa';
import { Span } from 'opentracing';

import sessionService from '../../services/session.service';

const sessionGetAllAction = actionHandler(
  {},
  {
    controller: 'SessionController',
    operation: 'SessionGetAllAction',
  },
  async (ctx: Context, span: Span) => {
    const sessions = await sessionService.getAll(span);
    ctx.status = 200;
    ctx.body = {
      data: sessions.map((session) => session.human()),
    };
  },
);

export default sessionGetAllAction;
