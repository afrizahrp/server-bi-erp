import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { sys_UserService } from 'src/sys/sys_user/sys_User.service';
import { PrismaService } from 'src/prisma.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtService } from '@nestjs/jwt';
import { RefreshStrategy } from './strategies/refresh-token.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import jwtConfig from './config/jwt.config';
import refreshConfig from './config/refresh.config';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles/role-guard';
import googleOauthConfig from './config/google-oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';
dotenv.config();

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshConfig),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    sys_UserService,
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, //@UseGuard(Roles)
    },
  ],
})
export class AuthModule {}
