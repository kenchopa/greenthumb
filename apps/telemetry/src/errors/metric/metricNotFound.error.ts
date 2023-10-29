import { HttpError, HttpStatusCode } from '@greenthumb/core';

export default class MetricNotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 'METRIC_NOT_FOUND_ERROR', HttpStatusCode.NOT_FOUND);
    Object.setPrototypeOf(this, MetricNotFoundError.prototype);
  }

  static forId(id: string) {
    return new this(`Metric is not found with id "${id}".`);
  }
}
