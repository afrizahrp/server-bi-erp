import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
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
      email: user.email,
      image: user.image,
    };
  }

  async login(name: string, password: string, company_id?: string) {
    const validatedUser = await this.validateLocalUser(name, password);

    const userCompanies = await this.prisma.sys_UserCompaniesRole.findMany({
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
    const user = await this.userService.findOne(id);
    if (!user) throw new UnauthorizedException('User not found!');

    const userCompaniesRole = await this.prisma.sys_UserCompaniesRole.findFirst(
      {
        where: { user_id: user.id },
        include: { role: true },
      },
    );

    if (!userCompaniesRole) {
      throw new UnauthorizedException('User role not found!');
    }

    const currentUser = { id: user.id, role_id: userCompaniesRole.role_id };
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

    const userCompaniesRole = await this.prisma.sys_UserCompaniesRole.findFirst(
      {
        where: { user_id: user.id },
        include: { role: true },
      },
    );

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
    await this.userService.updateHashedRefreshToken(id, hashedRT);
    return {
      id: id,
      accessToken,
      refreshToken,
    };
  }

  async signOut(id: number) {
    return await this.userService.updateHashedRefreshToken(id, null);
  }
}
