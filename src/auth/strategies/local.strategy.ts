import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'name',
    });
  }

  async validate(name: string, password: string): Promise<any> {
    const user = await this.authService.validateLocalUser(name, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
