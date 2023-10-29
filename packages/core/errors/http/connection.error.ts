import HttpError from '../http.error';
import HttpStatusCode from '../httpStatusCode.enum';

export default class ConnectionError extends HttpError {
  constructor(message: string) {
    super(message, 'CONNECTION_ERROR', HttpStatusCode.SERVICE_UNAVAILABLE);
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}
