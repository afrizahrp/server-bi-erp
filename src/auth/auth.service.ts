import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { sys_UserService } from 'src/sys/sys_user/sys_User.service';
import { Sys_CreateUserDto } from 'src/sys/sys_user/dto/sys_CreateUser.dto';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { ConfigType } from '@nestjs/config';
import refreshConfig from './config/refresh.config';
import { AuthJwtPayload } from './types/auth-jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    private readonly sys_userService: sys_UserService,
    private readonly jwtService: JwtService,
    private prisma: PrismaService,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  // async registerUser(sys_CreateUserDto: Sys_CreateUserDto) {
  //   const user = await this.sys_userService.findByName(sys_CreateUserDto.name);
  //   if (user) {
  //     throw new ConflictException('User already exists');
  //   }
  //   return this.sys_userService.create(sys_CreateUserDto);
  // }

  async registerUser(createUserDto: Sys_CreateUserDto) {
    const user = await this.sys_userService.findByEmail(createUserDto.email);
    if (user) throw new ConflictException('User already exists!');
    return this.sys_userService.create(createUserDto);
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.sys_userService.findByEmail(email);

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
      email: user.email,
      image: user.image,
      iStatus: 'Active',
    };
  }

  async login(email: string, password: string, company_id?: string) {
    const validatedUser = await this.validateLocalUser(email, password);

    const userCompanies = await this.prisma.sys_UserCompanyRole.findMany({
      where: { user_id: validatedUser.id },
      include: { role: true },
    });

    if (userCompanies.length === 0) {
      throw new UnauthorizedException('User has no company access');
    }

    // Jika company_id dikirim saat login, validasi apakah user memiliki akses ke company tersebut
    let selectedCompany: (typeof userCompanies)[0] | undefined = undefined;
    if (company_id) {
      selectedCompany = userCompanies.find(
        (c) => c.company_id.trim() === company_id,
      );
      if (!selectedCompany) {
        throw new UnauthorizedException(
          'User does not have access to the selected company',
        );
      }
    }

    // Jika user sudah memilih company, buat token
    let tokens: { accessToken: string; refreshToken: string } | null = null;
    if (selectedCompany) {
      tokens = await this.generateTokens(
        validatedUser.id,
        selectedCompany.role_id,
      );
    }

    return {
      user: {
        id: validatedUser.id,
        name: validatedUser.name,
        email: validatedUser.email,
        image: validatedUser.image,
        company: selectedCompany
          ? {
              company_id: selectedCompany.company_id.trim(),
              branch_id: selectedCompany.branch_id.trim(),
              role_id: selectedCompany.role_id.trim(),
              role_name: selectedCompany.role.name,
            }
          : null,
        companies: !selectedCompany
          ? userCompanies.map((c) => ({
              company_id: c.company_id.trim(),
              branch_id: c.branch_id.trim(),
              role_id: c.role_id,
              role_name: c.role.name,
            }))
          : undefined,
      },
      id: validatedUser.id,
      name: validatedUser.name,
      role_id: selectedCompany?.role_id || null,
      accessToken: tokens?.accessToken || null,
      refreshToken: tokens?.refreshToken || null,
      message: selectedCompany
        ? 'Login successful'
        : 'Please select a company and branch to continue',
    };
  }

  async generateTokens(id: number, role_id: string) {
    const payload: AuthJwtPayload = { sub: id, role_id };
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
    const user = await this.sys_userService.findOne(id);
    if (!user) throw new UnauthorizedException('User not found!');

    const userCompaniesRole = await this.prisma.sys_UserCompanyRole.findFirst({
      where: { user_id: user.id },
      include: { role: true },
    });

    if (!userCompaniesRole) {
      throw new UnauthorizedException('User role not found!');
    }

    const currentUser = { id: user.id, role_id: userCompaniesRole.role_id };
    return currentUser;
  }

  async validateRefreshToken(id: number, refreshToken: string) {
    const user = await this.sys_userService.findById(id);
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

    const userCompaniesRole = await this.prisma.sys_UserCompanyRole.findFirst({
      where: { user_id: user.id },
      include: { role: true },
    });

    if (!userCompaniesRole) {
      throw new UnauthorizedException('User role not found!');
    }

    const currentUser = { id: user.id, role_id: userCompaniesRole.role_id };
    return currentUser;
  }

  async refreshToken(id: number, role_id: string) {
    const { accessToken, refreshToken } = await this.generateTokens(
      id,
      role_id,
    );
    const hashedRT = await hash(refreshToken);
    await this.sys_userService.updateHashedRefreshToken(id, hashedRT);
    return {
      id: id,
      accessToken,
      refreshToken,
    };
  }

  async getUserCompanyRole(userId: number) {
    const userCompanyRole = await this.prisma.sys_UserCompanyRole.findFirst({
      where: { user_id: userId },
      include: { role: true },
    });
    return userCompanyRole;
  }

  async validateGoogleUser(googleUser: Sys_CreateUserDto) {
    const user = await this.sys_userService.findByEmail(googleUser.email);
    if (user) return user;
    return await this.sys_userService.create(googleUser);
  }

  async signOut(id: number) {
    return await this.sys_userService.updateHashedRefreshToken(id, null);
  }
}
