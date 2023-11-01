import { Role } from '@greenthumb/auth';
import { denyAccessUnlessGranted, Method, Route } from '@greenthumb/koa';

import sessionCreateAction from '../../controllers/session/create.controller';
import sessionDeleteByIdAction from '../../controllers/session/deleteById.controller';
import sessionGetAllAction from '../../controllers/session/getAll.controller';
import sessionGetByIdAction from '../../controllers/session/getById.controller';
import sessionUpdateAction from '../../controllers/session/update.controller';

const sessionRoutes: Array<Route> = [
  {
    action: sessionCreateAction,
    method: Method.POST,
    path: '/sessions',
    security: denyAccessUnlessGranted([Role.ANONYMOUS]),
  },
  {
    action: sessionGetAllAction,
    method: Method.GET,
    path: '/sessions',
    security: denyAccessUnlessGranted([Role.SYSTEM, Role.ADMIN]),
  },
  {
    action: sessionGetByIdAction,
    method: Method.GET,
    path: '/sessions/:id',
    security: denyAccessUnlessGranted([Role.SYSTEM, Role.ADMIN, Role.OPERATOR]),
  },
  {
    action: sessionUpdateAction,
    method: Method.PUT,
    path: '/sessions',
    security: denyAccessUnlessGranted([Role.ADMIN, Role.OPERATOR, Role.USER]),
  },
  {
    action: sessionDeleteByIdAction,
    method: Method.DEL,
    path: '/sessions',
    security: denyAccessUnlessGranted([
      Role.SYSTEM,
      Role.ADMIN,
      Role.OPERATOR,
      Role.USER,
    ]),
  },
];

export default sessionRoutes;
