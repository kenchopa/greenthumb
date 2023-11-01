import { Role, Token } from '@greenthumb/core';
import { ForbiddenError } from '@greenthumb/errors';
import { Context } from 'joi';
import { Next } from 'koa';

export default function denyAccessUnlessGranted(roles: Array<Role>) {
  return async (ctx: Context, next: Next) => {
    const { role } = ctx.state.token as Token;

    if (!roles.includes(role)) {
      throw ForbiddenError.forRole(role);
    }

    return next();
  };
}
