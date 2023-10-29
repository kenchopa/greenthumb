import helmet from 'koa-helmet';

export default function makeSecurityHeadersMiddleware() {
  return helmet();
}
