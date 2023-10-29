import { Token } from '@greenthumb/core';
import jwt_decode from 'jwt-decode';

export default function decodeToken(token: any): Token {
  const decodedToken: any = jwt_decode(token);

  return {
    expiredTime: decodedToken.exp || undefined,
    issuedAtTime: decodedToken.iat,
    issuer: decodedToken.iss,
    jwtId: decodedToken.jti,
    raw: token,
    role: decodedToken.rol,
    subject: decodedToken.sub || undefined,
  };
}
