import { HttpError, HttpStatusCode } from '@greenthumb/errors';

export default class ConflictedSessionError extends HttpError {
  constructor(message: string) {
    super(message, 'SESSION_NOT_FOUND_ERROR', HttpStatusCode.CONFLICT);
    Object.setPrototypeOf(this, ConflictedSessionError.prototype);
  }

  static forUserId(userId: string): ConflictedSessionError {
    return new this(`Already an user session ongoing for user "${userId}".`);
  }
}
