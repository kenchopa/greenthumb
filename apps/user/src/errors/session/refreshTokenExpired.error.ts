import { HttpError, HttpStatusCode } from '@greenthumb/errors';

export default class RefreshTokenExpiredError extends HttpError {
  constructor(message: string) {
    super(message, 'REFRESH_TOKEN_EXPIRED_ERROR', HttpStatusCode.FORBIDDEN);
    Object.setPrototypeOf(this, RefreshTokenExpiredError.prototype);
  }

  static expiredAt(expiredAt: Date): RefreshTokenExpiredError {
    return new this(
      `The refresh token of the session is expired at "${expiredAt.toISOString()}", please authenticate again.`,
    );
  }
}
