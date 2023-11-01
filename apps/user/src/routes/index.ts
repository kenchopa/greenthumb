import { Route } from '@greenthumb/koa';

import sessionRoutes from './session';
import userRoutes from './user';

const routes: Array<Route> = [...sessionRoutes, ...userRoutes];

export default routes;
