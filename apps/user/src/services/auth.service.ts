/* eslint-disable class-methods-use-this */
import { generateAccessToken, generateRefreshToken } from '@greenthumb/auth';
import { Role } from '@greenthumb/core';
import { createServiceSpan } from '@greenthumb/tracer';
import moment from 'moment';
import { Span } from 'opentracing';

import RefreshTokenExpiredError from '../errors/session/refreshTokenExpired.error';
import SessionNotFoundError from '../errors/session/sessionNotFound.error';
import User from '../models/user.model';
import sessionService, { SessionToUpdate } from './session.service';
import userService from './user.service';

const SERVICE = 'AuthService';

function makeAccessTokenExpiredAtDate() {
  return moment().add(1, 'hours');
}

function makeRefreshTokenExpiredAtDate() {
  return moment().add(1, 'day');
}

export type AuthenticatedResult = {
  loggedInUser: User;
  accessToken: string;
  accessTokenExpiredAt: Date;
  refreshToken: string;
  refreshTokenExpiredAt: Date;
  roles: Array<Role>;
};

export class AuthService {
  public async authenticate(
    login: string,
    password: string,
    span: Span,
  ): Promise<AuthenticatedResult> {
    const serviceSpan = createServiceSpan(SERVICE, 'authenticate', span);

    // Find user by username or email otherwise throw user not found error
    const user = await userService.getByUsernameOrEmail(login, span);

    // Try to login with given password otherwise throw invalid login error
    await user.login(password);

    // Check if there is already an session,
    // if so give same result back till expiration of access token
    try {
      const session = await sessionService.getNoneExpiredSessionForUser(
        user,
        span,
      );

      serviceSpan.finish();

      return {
        accessToken: session.accessToken,
        accessTokenExpiredAt: session.accessTokenExpiredAt,
        loggedInUser: user,
        refreshToken: session.refreshToken,
        refreshTokenExpiredAt: session.refreshTokenExpiredAt,
        roles: [user.role],
      };
    } catch (error) {
      if (!(error instanceof SessionNotFoundError)) {
        throw error;
      }

      // delete old session (unique constraint) so we can create a new access token.
      try {
        await sessionService.deleteByUser(user, span);
      } catch (err) {
        if (!(err instanceof SessionNotFoundError)) {
          throw err;
        }
      }
    }

    // Generate access token based on an user role for 1 hour
    const { id: userId, username, role } = user;
    const accessTokenExpiredAt = makeAccessTokenExpiredAtDate();
    const { raw: accessToken } = generateAccessToken(
      role,
      username,
      userId,
      accessTokenExpiredAt,
    );

    // Generate access token based on a user role for 1 day
    const refreshTokenExpiredAt = makeRefreshTokenExpiredAtDate();
    const { raw: refreshToken } = generateRefreshToken(
      role,
      username,
      userId,
      refreshTokenExpiredAt,
    );

    // Create new user session
    await sessionService.create(
      {
        accessToken,
        accessTokenExpiredAt: accessTokenExpiredAt.toDate(),
        refreshToken,
        refreshTokenExpiredAt: refreshTokenExpiredAt.toDate(),
        user,
      },
      span,
    );

    serviceSpan.finish();

    return {
      accessToken,
      accessTokenExpiredAt: accessTokenExpiredAt.toDate(),
      loggedInUser: user,
      refreshToken,
      refreshTokenExpiredAt: refreshTokenExpiredAt.toDate(),
      roles: [user.role],
    };
  }

  public async refresh(
    refreshToken: string,
    span: Span,
  ): Promise<AuthenticatedResult> {
    const session = await sessionService.getByRefreshToken(refreshToken, span);

    const { user, refreshTokenExpiredAt } = session;

    if (refreshTokenExpiredAt <= moment().toDate()) {
      throw RefreshTokenExpiredError.expiredAt(refreshTokenExpiredAt);
    }

    const newAccessTokenExpiredAt = makeAccessTokenExpiredAtDate();
    const newAccessToken = generateAccessToken(
      user.role,
      user.username,
      user.id,
      newAccessTokenExpiredAt,
    );

    const newRefreshTokenExpiredAt = moment(refreshTokenExpiredAt);
    const newRefreshToken = generateRefreshToken(
      user.role,
      user.username,
      user.id,
      newRefreshTokenExpiredAt,
    );

    const sessionToUpdate: SessionToUpdate = {
      accessToken: newAccessToken.raw,
      accessTokenExpiredAt: newAccessTokenExpiredAt.toDate(),
      id: session.id,
      refreshToken: newRefreshToken.raw,
      refreshTokenExpiredAt: newRefreshTokenExpiredAt.toDate(),
      user,
    };

    await sessionService.update(sessionToUpdate, span);

    return {
      accessToken: newAccessToken.raw,
      accessTokenExpiredAt: newAccessTokenExpiredAt.toDate(),
      loggedInUser: user,
      refreshToken: newRefreshToken.raw,
      refreshTokenExpiredAt: newRefreshTokenExpiredAt.toDate(),
      roles: [user.role],
    };
  }
}

const authService = new AuthService();

export default authService;
