import { HttpError, HttpStatusCode } from '@greenthumb/errors';

export default class UserDuplicateEmailError extends HttpError {
  constructor(message: string) {
    super(message, 'USER_DUPLICATE_EMAIL_ERROR', HttpStatusCode.CONFLICT);
    Object.setPrototypeOf(this, UserDuplicateEmailError.prototype);
  }

  static forEmail(email: string) {
    return new this(`User with email "${email}" is already in the system.`);
  }
}
