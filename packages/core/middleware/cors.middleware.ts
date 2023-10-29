import koaConvert from 'koa-convert';
import koaCors from 'koa-cors';

export default function makeCorsMiddleware() {
  // Adds CORS header middleware
  const options = {
    expose: [
      'Accept-Ranges',
      'Content-Encoding',
      'Content-Type',
      'Content-Length',
      'Content-Range',
      'Range',
      'authorization',
      'x-correlation-id',
    ],
    headers: [
      'Accept-Ranges',
      'Content-Encoding',
      'Content-Type',
      'Content-Length',
      'Content-Range',
      'Range',
      'authorization',
      'x-correlation-id',
    ],
    origin: true,
  };

  return koaConvert(koaCors(options));
}
