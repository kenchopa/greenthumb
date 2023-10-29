import { denyAccessUnlessGranted } from '@greenthumb/auth';
import { Method, Role, Route } from '@greenthumb/core';

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
