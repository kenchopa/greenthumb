import { HttpError, HttpStatusCode } from '@greenthumb/core';

export default class SessionNotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 'SESSION_NOT_FOUND_ERROR', HttpStatusCode.NOT_FOUND);
    Object.setPrototypeOf(this, SessionNotFoundError.prototype);
  }

  static forId(id: string): SessionNotFoundError {
    return new this(`No session is found for id "${id}".`);
  }

  static forUserId(userId: string): SessionNotFoundError {
    return new this(`No session is found for user "${userId}".`);
  }

  static forRefreshToken(refreshToken: string): SessionNotFoundError {
    const truncated = refreshToken.replace(/(.{7})..+/, '$1…');
    return new this(`No session is found for refresh token "${truncated}".`);
  }
}
