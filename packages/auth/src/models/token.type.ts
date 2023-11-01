import Role from './role.enum';

type Token = {
  expiredTime?: number;
  issuedAtTime: number;
  issuer: string;
  jwtId: string;
  raw: string;
  role: Role;
  subject?: string;
};

export default Token;
