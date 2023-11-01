import { HttpError, HttpStatusCode } from '@greenthumb/errors';

export default class UserLoginError extends HttpError {
  constructor(message: string) {
    super(message, 'USER_LOGIN_ERROR', HttpStatusCode.BAD_REQUEST);
    Object.setPrototypeOf(this, UserLoginError.prototype);
  }

  static invalidLogin() {
    return new this('Unable to login with given username or email.');
  }
}
