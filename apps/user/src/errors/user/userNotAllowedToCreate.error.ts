import { HttpError, HttpStatusCode } from '@greenthumb/errors';

export default class UserNotAllowedToCreateError extends HttpError {
  constructor(message: string) {
    super(
      message,
      'USER_NOT_ALLOWED_TO_CREATE_ERROR',
      HttpStatusCode.FORBIDDEN,
    );
    Object.setPrototypeOf(this, UserNotAllowedToCreateError.prototype);
  }

  static forRole(role: string) {
    return new this(`Not allowed to create an user with role "${role}".`);
  }
}
