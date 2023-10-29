import { v4 as uuidV4 } from 'uuid';

import config from '../config';
import {
  UserLoginRequest,
  UserRegisterRequest,
  UserRole,
} from '../types/user.type';
import SecuredHttpClient from './secured-http.client';

type RegisteredUser = {
  id: string;
  role: UserRole;
};

export type LoggedInUser = {
  id: string;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
};

export type Session = {
  accessToken: string;
  accessTokenExpiredAt: Date;
  refreshToken: string;
  refreshTokenExpiredAt: Date;
  loggedInUser: LoggedInUser;
};

export default class AuthClient extends SecuredHttpClient {
  constructor() {
    super(config.SERVICES.USER, config.AUTH.JWT_ANONYMOUS);
  }

  public async register(registerRequest: UserRegisterRequest) {
    const {
      data: { data: registeredUser },
    } = await this.instance.post<{ data: RegisteredUser }>(
      '/users',
      {
        role: 'user',
        ...registerRequest,
      },
      {
        headers: {
          'x-correlation-id': uuidV4(),
        },
      },
    );

    return registeredUser;
  }

  public async login(loginRequest: UserLoginRequest) {
    const {
      data: { data: session },
    } = await this.instance.post<{ data: Session }>('/sessions', loginRequest, {
      headers: {
        'x-correlation-id': uuidV4(),
      },
    });

    return session;
  }
}
