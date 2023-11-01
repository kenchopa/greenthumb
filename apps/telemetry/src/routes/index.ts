import { Route } from '@greenthumb/koa';

import metricRoutes from './metric';

const routes: Array<Route> = [...metricRoutes];

export default routes;
