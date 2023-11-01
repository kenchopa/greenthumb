import { Role } from '@greenthumb/auth';
import { Method, Route } from '@greenthumb/core';
import { denyAccessUnlessGranted } from '@greenthumb/koa-middleware';

import metricGetAllAction from '../../controllers/metric/getAll.controller';
import metricGetByIdAction from '../../controllers/metric/getById.controller';

const metricRoutes: Array<Route> = [
  {
    action: metricGetAllAction,
    method: Method.GET,
    path: '/metrics',
    security: denyAccessUnlessGranted([
      Role.SYSTEM,
      Role.ADMIN,
      Role.OPERATOR,
      Role.USER,
    ]),
  },
  {
    action: metricGetByIdAction,
    method: Method.GET,
    path: '/metrics/:id',
    security: denyAccessUnlessGranted([
      Role.SYSTEM,
      Role.ADMIN,
      Role.OPERATOR,
      Role.USER,
    ]),
  },
];

export default metricRoutes;
