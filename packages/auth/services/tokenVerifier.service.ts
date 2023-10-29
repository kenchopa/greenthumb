import { Role, Token } from '@greenthumb/core';
import fs from 'fs';
import jwt from 'jsonwebtoken';

type JwtPublicKeyFileEnv =
  | 'JWT_SYSTEM_PUBLIC_KEY_FILE'
  | 'JWT_ADMIN_PUBLIC_KEY_FILE'
  | 'JWT_OPERATOR_PUBLIC_KEY_FILE'
  | 'JWT_USER_PUBLIC_KEY_FILE'
  | 'JWT_ANONYMOUS_PUBLIC_KEY_FILE'
  | 'JWT_REFRESH_PUBLIC_KEY_FILE';

function getPublicJwtKey(env: JwtPublicKeyFileEnv) {
  const publicJwtFilePath = process.env[env];

  if (!publicJwtFilePath) {
    throw new Error(`Please provide a correct public jwt env "${env}".`);
  }

  try {
    return fs.readFileSync(publicJwtFilePath);
  } catch (error) {
    throw new Error(
      `Failed to read the public key file location for env "${env}": ${
        (error as Error).message
      }`,
    );
  }
}

export default function verifyToken(token: Token) {
  const { role, raw } = token;

  switch (role) {
    case Role.SYSTEM:
      jwt.verify(raw, getPublicJwtKey('JWT_SYSTEM_PUBLIC_KEY_FILE'));
      break;
    case Role.ADMIN:
      jwt.verify(raw, getPublicJwtKey('JWT_ADMIN_PUBLIC_KEY_FILE'));
      break;
    case Role.OPERATOR:
      jwt.verify(raw, getPublicJwtKey('JWT_OPERATOR_PUBLIC_KEY_FILE'));
      break;
    case Role.USER:
      jwt.verify(raw, getPublicJwtKey('JWT_USER_PUBLIC_KEY_FILE'));
      break;
    case Role.ANONYMOUS:
      jwt.verify(raw, getPublicJwtKey('JWT_ANONYMOUS_PUBLIC_KEY_FILE'));
      break;
    default:
      throw new Error('Please provide a correct role in the given JWT token.');
  }
}
