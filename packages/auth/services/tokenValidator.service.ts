import { Role, Token } from '@greenthumb/core';
import Joi from 'joi';
import jwt from 'jsonwebtoken';

/**
 * iss (issuer): Issuer of the JWT
 * sub (subject): Subject of the JWT (the user)
 * aud (audience): Recipient for which the JWT is intended
 * exp (expiration time): Time after which the JWT expires
 * nbf (not before time): Time before which the JWT must not be accepted for processing
 * iat (issued at time): Time at which the JWT was issued; can be used to determine age of the JWT
 * jti (JWT ID): Unique identifier; can be used to prevent the JWT from being replayed (allows a token to be used only once)
 */
const tokenSchema = Joi.object({
  exp: Joi.number().optional(),
  iat: Joi.number().required(),
  iss: Joi.string().required(),
  jti: Joi.string().required(),
  rol: Joi.string().valid(
    Role.SYSTEM,
    Role.ANONYMOUS,
    Role.ADMIN,
    Role.OPERATOR,
    Role.USER,
  ),
  sub: Joi.string().optional(),
});

export default function validateToken(token: any): Token {
  const decodedToken: any = jwt.decode(token);

  const {
    error,
    value: { exp, iat, iss, jti, rol, sub },
  } = tokenSchema.validate(decodedToken, {
    abortEarly: true,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    throw error;
  }

  return {
    expiredTime: exp || undefined,
    issuedAtTime: iat,
    issuer: iss,
    jwtId: jti,
    raw: token,
    role: rol,
    subject: sub || undefined,
  };
}
