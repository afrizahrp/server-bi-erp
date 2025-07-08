import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { MasterRecordStatusEnum } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private readonly googleConfig: ConfigType<typeof googleOauthConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: googleConfig.clientID,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: false, // Explicitly set to false to use StrategyOptions
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      name: profile.displayName,
      role_id: profile.id, // Use profile.id as role_id
      password: '',
      iStatus: MasterRecordStatusEnum.Active, // Default status
      isAdmin: false, // Default to non-admin
    });

    done(null, {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      iStatus: user.iStatus,
      isAdmin: user.isAdmin,
      hashedRefreshToken: user.hashedRefreshToken,
    });

    // done(null, user);
    // return user;
    // request.user
  }
}
