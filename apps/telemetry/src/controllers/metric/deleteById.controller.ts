import { HttpStatusCode } from '@greenthumb/errors';
import { actionHandler, Request } from '@greenthumb/koa';
import Joi from 'joi';
import { Context } from 'koa';
import { Span } from 'opentracing';

import metricService from '../../services/metric.service';

const metricDeleteByIdAction = actionHandler(
  {
    params: Joi.object({
      id: Joi.string().guid(),
    }),
  },
  {
    controller: 'MetricController',
    operation: 'DeleteByIdAction',
  },
  async (ctx: Context, span: Span, { params }: Request) => {
    const { id } = params;
    await metricService.deleteMetric(id);
    ctx.status = HttpStatusCode.NO_CONTENT;
  },
);

export default metricDeleteByIdAction;
