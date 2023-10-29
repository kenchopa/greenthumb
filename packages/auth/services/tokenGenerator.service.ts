import { Role } from '@greenthumb/core';
import fs from 'fs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import { v4 as uuidv4 } from 'uuid';

import validateToken from './tokenValidator.service';

type JwtPrivateKeyFileEnv =
  | 'JWT_SYSTEM_PRIVATE_KEY_FILE'
  | 'JWT_ADMIN_PRIVATE_KEY_FILE'
  | 'JWT_OPERATOR_PRIVATE_KEY_FILE'
  | 'JWT_USER_PRIVATE_KEY_FILE'
  | 'JWT_ANONYMOUS_PRIVATE_KEY_FILE'
  | 'JWT_REFRESH_PRIVATE_KEY_FILE';

const rolePrivateJwtMap = new Map<Role, JwtPrivateKeyFileEnv>([
  [Role.ANONYMOUS, 'JWT_ANONYMOUS_PRIVATE_KEY_FILE'],
  [Role.SYSTEM, 'JWT_SYSTEM_PRIVATE_KEY_FILE'],
  [Role.ADMIN, 'JWT_ADMIN_PRIVATE_KEY_FILE'],
  [Role.OPERATOR, 'JWT_OPERATOR_PRIVATE_KEY_FILE'],
  [Role.USER, 'JWT_USER_PRIVATE_KEY_FILE'],
]);

function getPrivateJwtKey(env: JwtPrivateKeyFileEnv) {
  const privateJwtFilePath = process.env[env];

  if (!privateJwtFilePath) {
    throw new Error(`Please provide a correct private jwt env "${env}".`);
  }

  try {
    return fs.readFileSync(privateJwtFilePath);
  } catch (error) {
    throw new Error(
      `Failed to read the private key file location for env "${env}": ${
        (error as Error).message
      }`,
    );
  }
}

function getPrivateJwtKeyByRole(role: Role) {
  const privateJwtKeyFilePathByRole = rolePrivateJwtMap.get(role);
  if (!privateJwtKeyFilePathByRole) {
    throw new Error(
      `Private JWT file path cannot be found for role "${role}".`,
    );
  }

  return getPrivateJwtKey(privateJwtKeyFilePathByRole);
}

export function generateAccessToken(
  role: Role,
  issuer: string,
  subjectId?: string,
  expiredAt?: Moment,
) {
  const subjectRoles = [Role.ADMIN, Role.OPERATOR, Role.OPERATOR];
  if (subjectRoles.includes(role) && !expiredAt) {
    throw new Error(`expiredAt date cannot be null for role "${role}"`);
  }

  let payload: JwtPayload = {
    iat: moment().unix(),
    iss: issuer,
    jti: uuidv4(),
    rol: role,
    sub: subjectId,
  };

  if (expiredAt) {
    payload = {
      ...payload,
      exp: expiredAt.unix(),
    };
  }

  return validateToken(
    jwt.sign(payload, getPrivateJwtKeyByRole(role), {
      algorithm: 'RS256',
    }),
  );
}

export function generateRefreshToken(
  role: Role,
  issuer: string,
  subjectId: string,
  expiredAt: Moment,
) {
  return validateToken(
    jwt.sign(
      {
        exp: expiredAt.unix(),
        iat: moment().unix(),
        iss: issuer,
        jti: uuidv4(),
        rol: role,
        sub: subjectId,
      },
      getPrivateJwtKey('JWT_REFRESH_PRIVATE_KEY_FILE'),
      {
        algorithm: 'RS256',
      },
    ),
  );
}
