import { Role } from '@greenthumb/auth';
import { Method, Route } from '@greenthumb/core';
import { denyAccessUnlessGranted } from '@greenthumb/koa-middleware';

import userCreateAction from '../../controllers/user/create.controller';
import userDeleteByIdAction from '../../controllers/user/deleteById.controller';
import userGetAllAction from '../../controllers/user/getAll.controller';
import userGetByIdAction from '../../controllers/user/getById.controller';
import userUpdateAction from '../../controllers/user/update.controller';

const userRoutes: Array<Route> = [
  {
    action: userGetAllAction,
    method: Method.GET,
    path: '/users',
    security: denyAccessUnlessGranted([Role.SYSTEM, Role.ADMIN, Role.OPERATOR]),
  },
  {
    action: userGetByIdAction,
    method: Method.GET,
    path: '/users/:id',
    security: denyAccessUnlessGranted([
      Role.SYSTEM,
      Role.ADMIN,
      Role.OPERATOR,
      Role.USER,
    ]),
  },
  {
    action: userCreateAction,
    method: Method.POST,
    path: '/users',
    security: denyAccessUnlessGranted([
      Role.SYSTEM,
      Role.ANONYMOUS,
      Role.ADMIN,
      Role.OPERATOR,
    ]),
  },
  {
    action: userUpdateAction,
    method: Method.PUT,
    path: '/users/:id',
    security: denyAccessUnlessGranted([Role.SYSTEM, Role.ADMIN, Role.OPERATOR]),
  },
  {
    action: userDeleteByIdAction,
    method: Method.DEL,
    path: '/users/:id',
    security: denyAccessUnlessGranted([Role.SYSTEM, Role.ADMIN, Role.OPERATOR]),
  },
];

export default userRoutes;
