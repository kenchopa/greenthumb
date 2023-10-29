import HttpError from '../http.error';
import HttpStatusCode from '../httpStatusCode.enum';

export default class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(message, 'FORBIDDEN_ERROR', HttpStatusCode.FORBIDDEN);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  static forRole(role: string): ForbiddenError {
    return new this(`Not allowed to access this action with role "${role}".`);
  }
}
