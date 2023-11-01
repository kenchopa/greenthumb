import { Role } from '@greenthumb/auth';

export type UserRole = Role.USER | Role.OPERATOR | Role.ADMIN;

export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
  firstName: string;
  lastName: string;
}

export interface UserLoginRequest {
  login: string;
  password: string;
}
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
