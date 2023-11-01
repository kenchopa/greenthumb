import { Role } from '@greenthumb/auth';
import { HttpError, HttpStatusCode } from '@greenthumb/errors';

export default class UserRoleNotFound extends HttpError {
  constructor(message: string) {
    super(message, 'USER_ROLE_NOT_FOUND_ERROR', HttpStatusCode.NOT_FOUND);
    Object.setPrototypeOf(this, UserRoleNotFound.prototype);
  }

  static forUnknownRole(role: Role) {
    return new this(`Unknown role "${role}" not found.`);
  }
}
