import HttpError from '../http.error';
import HttpStatusCode from '../httpStatusCode.enum';

export default class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 'NOT_FOUND_ERROR', HttpStatusCode.NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  static forResource(resource: string): NotFoundError {
    return new this(`Resource "${resource}" not found.`);
  }

  static forRoute(route: string): NotFoundError {
    return new this(`Route "${route}" not found.`);
  }
}
