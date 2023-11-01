import { HttpStatusCode } from '@greenthumb/errors';
import { actionHandler } from '@greenthumb/koa';
import { Context } from 'koa';
import { Span } from 'opentracing';

import metricService from '../../services/metric.service';

const metricGetAllAction = actionHandler(
  {},
  {
    controller: 'MetricController',
    operation: 'GetAllAction',
  },
  async (ctx: Context, span: Span) => {
    const metrics = await metricService.getAll(span);
    ctx.status = HttpStatusCode.OK;
    ctx.body = {
      data: metrics,
    };
  },
);

export default metricGetAllAction;
