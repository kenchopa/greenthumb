/* eslint-disable import/prefer-default-export */
import 'dotenv/config';

import { generateAccessToken, Role } from '@greenthumb/auth';
import moment from 'moment';

const forRole = process.argv[2];
if (!Object.values(Role).includes(forRole as Role)) {
  throw new Error(`Cannot find given role: "${forRole}"`);
}

const accessToken = generateAccessToken(
  forRole as Role,
  forRole,
  undefined,
  moment().add(14, 'days'),
);
// eslint-disable-next-line no-console
console.log(accessToken);
process.exit(0);
