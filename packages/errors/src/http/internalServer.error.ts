import HttpError from '../http.error';
import HttpStatusCode from '../httpStatusCode.enum';

export default class InternalServerError extends HttpError {
  constructor(message: string) {
    super(
      message,
      'INTERNAL_SERVER_ERROR',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
    );
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
