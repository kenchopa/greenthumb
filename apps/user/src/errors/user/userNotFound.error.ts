import { HttpError, HttpStatusCode } from '@greenthumb/errors';

export default class UserNotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 'USER_NOT_FOUND_ERROR', HttpStatusCode.NOT_FOUND);
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }

  static forId(id: string) {
    return new this(`User is not found with id "${id}".`);
  }

  static forLogin(login: string) {
    return new this(`User is not found for login "${login}".`);
  }
}
