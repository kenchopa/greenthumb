import asyncHooks from 'async_hooks';

import Role from '../models/role.enum';
import Token from '../models/token.type';

export type RequestContext = {
  actorType: Role;
  actorId?: string;
  accessToken?: Token;
  correlationId: string;
};

const storage = new Map<string | number, RequestContext>();

const requestContextHook = asyncHooks.createHook({
  destroy: (asyncId) => {
    if (storage.has(asyncId)) {
      storage.delete(asyncId);
    }
  },
  init: (asyncId, _, triggerAsyncId) => {
    // Set the stored context value of current async
    // process to the value of it's parent
    if (storage.has(triggerAsyncId)) {
      storage.set(
        asyncId,
        // Asserted through Map.has
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        storage.get(triggerAsyncId)!,
      );
    }
  },
});

requestContextHook.enable();

export function setRequestContext(ctx: Partial<RequestContext>) {
  const asyncId = asyncHooks.executionAsyncId();

  const requestContext = {
    ...storage.get(asyncId),
    // Filter out nullish values
    ...Object.fromEntries(
      Object.entries(ctx).filter(([, value]) => value != null),
    ),
  } as RequestContext;

  storage.set(asyncId, requestContext);
  return requestContext;
}

export function getRequestContext() {
  return (
    storage.get(asyncHooks.executionAsyncId()) ??
    setRequestContext({ actorType: Role.ANONYMOUS })
  );
}
