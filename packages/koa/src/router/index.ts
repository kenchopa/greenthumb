import Router from 'koa-router';

export enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DEL = 'del',
}

export type Route = {
  action: Router.IMiddleware;
  method: Method;
  security: Router.IMiddleware;
  path: string;
};

export default function makeRouter(routes: Array<Route>) {
  const router = new Router();

  routes.forEach(({ action, method, path, security }) => {
    switch (method) {
      case Method.GET:
        router.get(path, security, action);
        break;
      case Method.POST:
        router.post(path, security, action);
        break;
      case Method.PUT:
        router.put(path, security, action);
        break;
      case Method.DEL:
        router.del(path, security, action);
        break;
      default:
        throw new Error(
          'Method is not accessible in the router helper function.',
        );
    }
  });

  return router;
}
