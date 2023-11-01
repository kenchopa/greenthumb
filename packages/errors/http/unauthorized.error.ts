import HttpError from '../http.error';
import HttpStatusCode from '../httpStatusCode.enum';

export default class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(message, 'UNAUTHORIZED_ERROR', HttpStatusCode.UNAUTHORIZED);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
