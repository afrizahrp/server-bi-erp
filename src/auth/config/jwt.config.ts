import { registerAs } from '@nestjs/config';

import { JwtModuleOptions } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: process.env.JWT_EXPIRES },
  }),
);
