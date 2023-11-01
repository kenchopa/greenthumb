import { HttpError, HttpStatusCode } from '@greenthumb/errors';
import { RequestRules } from '@greenthumb/koa';
import {
  type TracerContext,
  createControllerSpan,
  finishSpanWithResult,
} from '@greenthumb/tracer';
import { Context, DefaultState } from 'koa';
import { Span } from 'opentracing';

export declare type Request = {
  query?: any;
  params?: any;
  body?: any;
};

type RouteFunction = (
  ctx: Context,
  span: Span,
  state: DefaultState,
) => Promise<void>;

export function actionHandler(
  schema: RequestRules,
  tracerContext: TracerContext,
  routeFunction: RouteFunction,
) {
  const rules = schema ?? {};
  return async (ctx: Context) => {
    const {
      request: { header, method, url },
    } = ctx;
    const { controller, operation } = tracerContext;

    const controllerSpan = createControllerSpan(
      controller,
      operation,
      method,
      url,
      header,
    );

    try {
      // Validate request against rules
      await ctx.validate(rules);

      // create request object
      const { body, params, query } = ctx.state;
      const request: Request = {
        body,
        params,
        query,
      };

      // execute action
      await routeFunction(ctx, controllerSpan, request);

      // finish off with trace
      return finishSpanWithResult(controllerSpan, 200);
    } catch (error) {
      if (!(error instanceof Error)) {
        finishSpanWithResult(
          controllerSpan,
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          true,
        );
        throw error;
      }

      controllerSpan.log({
        event: operation,
        value: error.message,
      });

      if (!(error instanceof HttpError)) {
        finishSpanWithResult(
          controllerSpan,
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          true,
        );
        throw error;
      }

      ctx.status = error.httpStatusCode;

      finishSpanWithResult(controllerSpan, error.httpStatusCode, true);

      throw error;
    }
  };
}
