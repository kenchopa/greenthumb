import Koa from 'koa';
import koaQs from 'koa-qs';

export default function makeQueryStringMiddleware(app: Koa) {
  return koaQs(app);
}
