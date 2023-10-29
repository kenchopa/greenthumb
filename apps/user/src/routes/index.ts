import { Route } from '@greenthumb/core';

import sessionRoutes from './session';
import userRoutes from './user';

const routes: Array<Route> = [...sessionRoutes, ...userRoutes];

export default routes;
