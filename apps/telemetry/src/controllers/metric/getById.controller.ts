import { actionHandler, HttpStatusCode, Request } from '@greenthumb/core';
import Joi from 'joi';
import { Context } from 'koa';
import { Span } from 'opentracing';

import metricService from '../../services/metric.service';

const metricGetByIdAction = actionHandler(
  {
    params: Joi.object({
      id: Joi.string().guid(),
    }),
  },
  {
    controller: 'MetricController',
    operation: 'GetByIdAction',
  },
  async (ctx: Context, span: Span, { params }: Request) => {
    const { id } = params;
    const metric = await metricService.getById(id, span);
    ctx.status = HttpStatusCode.OK;
    ctx.body = {
      data: metric,
    };
  },
);

export default metricGetByIdAction;
