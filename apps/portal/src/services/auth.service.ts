import AuthClient from '../client/auth.client';
import {
  destroySession,
  getSession as getLoggedInSession,
  setSession,
} from '../contexts/auth.context';
import { UserLoginRequest, UserRegisterRequest } from '../types/user.type';

const authHttpClient = new AuthClient();

export const register = async (body: UserRegisterRequest) => {
  return authHttpClient.register(body);
};

export const login = async (body: UserLoginRequest) => {
  const loggedInUser = await authHttpClient.login(body);

  setSession(loggedInUser);

  return loggedInUser;
};

export const logout = () => {
  destroySession();
};

export const getCurrentSession = () => {
  try {
    return getLoggedInSession();
  } catch (error) {
    return null;
  }
};
