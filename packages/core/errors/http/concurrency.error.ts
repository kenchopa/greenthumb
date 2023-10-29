import HttpError from '../http.error';
import HttpStatusCode from '../httpStatusCode.enum';

export default class ConcurrencyError extends HttpError {
  constructor(message: string) {
    super(message, 'CONCURRENCY_ERROR', HttpStatusCode.CONFLICT);
    Object.setPrototypeOf(this, ConcurrencyError.prototype);
  }

  public static create(message?: string): ConcurrencyError {
    return new ConcurrencyError(message || 'Concurrency detected');
  }
}
