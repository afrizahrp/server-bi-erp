import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { LoginDto } from './dto/login.dto';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

import { ConfigType } from '@nestjs/config';
import refreshConfig from './config/refresh.config';
import { AuthJwtPayload } from './types/auth-jwtPayload';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private prisma: PrismaService,

    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  async registerUser(CreateUserDto: CreateUserDto) {
    const user = await this.userService.findByName(CreateUserDto.name);
    if (user) {
      throw new ConflictException('User already exists');
    }
    return this.userService.create(CreateUserDto);
  }

  async validateLocalUser(name: string, password: string) {
    const user = await this.userService.findByName(name);

    if (!user) {
      throw new UnauthorizedException('User has not been registered');
    }

    const isPasswordMatch = await verify(user.password, password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return {
      id: user.id,
      name: user.name,
      role_id: user.role_id,
      email: user.email,
      image: user.image,
    };
  }

  async login(
    id: number,
    name: string,
    company_id: string,
    role_id: number,
    email: string,
    image: string,
  ) {
    const role = await this.prisma.sys_Roles.findUnique({
      where: { id: role_id },
    });

    if (!role) {
      throw new UnauthorizedException('Role not found');
    }
    const { accessToken, refreshToken } = await this.generateTokens(id);
    return {
      user: {
        id,
        name,
        company_id,
        role_id,
        role_name: role.name,
        email,
        image,
      },
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(id: number) {
    const payload: AuthJwtPayload = { sub: id };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateJwtUser(id: number) {
    const user = await this.userService.findOne(id);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser = { id: user.id, role_id: user.role_id };
    return currentUser;
  }

  async validateRefreshToken(id: number, refreshToken: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new UnauthorizedException('User not found!');

    if (!user.hashedRefreshToken) {
      throw new UnauthorizedException('Invalid Refresh Token!');
    }

    const refreshTokenMatched = await verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    if (!refreshTokenMatched)
      throw new UnauthorizedException('Invalid Refresh Token!');
    const currentUser = { id: user.id };
    return currentUser;
  }

  async refreshToken(id: number) {
    const { accessToken, refreshToken } = await this.generateTokens(id);
    const hashedRT = await hash(refreshToken);
    await this.userService.updateHashedRefreshToken(id, hashedRT);
    return {
      id: id,
      name: name,
      accessToken,
      refreshToken,
    };
  }

  async signOut(id: number) {
    return await this.userService.updateHashedRefreshToken(id, null);
  }
}
