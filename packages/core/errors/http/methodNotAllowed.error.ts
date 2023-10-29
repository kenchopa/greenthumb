import HttpError from '../http.error';
import HttpStatusCode from '../httpStatusCode.enum';

export default class MethodNotAllowedError extends HttpError {
  constructor(message: string) {
    super(
      message,
      'METHOD_NOT_ALLOWED_ERROR',
      HttpStatusCode.METHOD_NOT_ALLOWED,
    );
    Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
  }

  static forMethod(method: string): MethodNotAllowedError {
    return new this(`Method "${method}" not allowed.`);
  }
}
