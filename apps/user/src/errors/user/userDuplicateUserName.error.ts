import { HttpError, HttpStatusCode } from '@greenthumb/core';

export default class UserDuplicateUsernameError extends HttpError {
  constructor(message: string) {
    super(message, 'USER_DUPLICATE_USERNAME_ERROR', HttpStatusCode.CONFLICT);
    Object.setPrototypeOf(this, UserDuplicateUsernameError.prototype);
  }

  static forUsername(username: string) {
    return new this(
      `User with username "${username}" is already in the system.`,
    );
  }
}
