import { HttpError, HttpStatusCode } from '@greenthumb/errors';

export default class InvalidTokenError extends HttpError {
  constructor(message: string) {
    super(message, 'INVALID_TOKEN_ERROR', HttpStatusCode.BAD_REQUEST);
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }

  static forDataType(expected: string, actual: any): InvalidTokenError {
    return new this(
      `Invalid token datatype should be "${expected}" instead of "${actual}".`,
    );
  }
}
