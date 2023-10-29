import HttpError from '../http.error';
import HttpStatusCode from '../httpStatusCode.enum';

export default class UnprocessableEntityError extends HttpError {
  constructor(message: string) {
    super(message, 'UNPROCESSABLE_ERROR', HttpStatusCode.UNPROCESSABLE_ENTITY);
    Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
  }
}
