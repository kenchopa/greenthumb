import logger from '@greenthumb/logger';
import { initTracer as initJaegerTracer } from 'jaeger-client';
import * as opentracing from 'opentracing';

export type TracerContext = {
  controller: string;
  operation: string;
};

const initTracer = (serviceName?: string) => {
  if (!serviceName) {
    throw new Error('Please provide "SERVICE_NAME" as an env.');
  }

  const traceConfig = {
    reporter: {
      logSpans: true,
    },
    sampler: {
      param: 1,
      type: 'const',
    },
    serviceName,
  };

  const traceOptions = {
    logger: {
      error: (msg: string) => logger.error(msg),
      info: (msg: string) => logger.info(msg),
    },
  };

  return initJaegerTracer(traceConfig, traceOptions);
};

export const tracer = initTracer(
  process.env.SERVICE_NAME,
) as opentracing.Tracer;

export function createControllerSpan(
  controller: string,
  operation: string,
  method: string,
  url: string,
  headers: any,
): opentracing.Span {
  // create child span on parent when parent is defined
  const parentSpan = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, headers);
  if (parentSpan) {
    return tracer.startSpan(operation, {
      childOf: parentSpan,
      tags: {
        [opentracing.Tags.SPAN_KIND]: opentracing.Tags.SPAN_KIND_RPC_SERVER,
        [opentracing.Tags.COMPONENT]: controller,
        [opentracing.Tags.HTTP_METHOD]: method,
        [opentracing.Tags.HTTP_URL]: url,
      },
    });
  }

  // create root span
  return tracer.startSpan(operation, {
    tags: {
      [opentracing.Tags.SPAN_KIND]: opentracing.Tags.SPAN_KIND_RPC_SERVER,
      [opentracing.Tags.COMPONENT]: controller,
      [opentracing.Tags.HTTP_METHOD]: method,
      [opentracing.Tags.HTTP_URL]: url,
    },
  });
}

export function createEntitySpan(
  entityName: string,
  operation: string,
  parentSpan?: opentracing.Span,
) {
  // create child span on parent when parent is defined
  if (parentSpan) {
    return tracer.startSpan(operation, {
      childOf: parentSpan,
      tags: {
        [opentracing.Tags.SPAN_KIND]: opentracing.Tags.SPAN_KIND_RPC_SERVER,
        [opentracing.Tags.COMPONENT]: entityName,
      },
    });
  }

  // create root span
  return tracer.startSpan(operation, {
    tags: {
      [opentracing.Tags.SPAN_KIND]: opentracing.Tags.SPAN_KIND_RPC_SERVER,
      [opentracing.Tags.COMPONENT]: entityName,
    },
  });
}

export function createServiceSpan(
  serviceName: string,
  operation: string,
  parentSpan?: opentracing.Span,
) {
  // create child span on parent when parent is defined
  if (parentSpan) {
    return tracer.startSpan(operation, {
      childOf: parentSpan,
      tags: {
        [opentracing.Tags.SPAN_KIND]: opentracing.Tags.SPAN_KIND_RPC_SERVER,
        [opentracing.Tags.COMPONENT]: serviceName,
      },
    });
  }

  // create root span
  return tracer.startSpan(operation, {
    tags: {
      [opentracing.Tags.SPAN_KIND]: opentracing.Tags.SPAN_KIND_RPC_SERVER,
      [opentracing.Tags.COMPONENT]: serviceName,
    },
  });
}

export function finishSpanWithResult(
  span: opentracing.Span,
  status: Number,
  errorTag?: boolean,
) {
  span.setTag(opentracing.Tags.HTTP_STATUS_CODE, status);
  if (errorTag) {
    span.setTag(opentracing.Tags.ERROR, true);
  }
  span.finish();
}
