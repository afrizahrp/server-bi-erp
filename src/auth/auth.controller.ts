import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  Request,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Sys_CreateUserDto } from 'src/sys/sys_user/dto/sys_CreateUser.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';

import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Response } from 'express';

import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles/role-guard';

import { PrismaService } from 'src/prisma.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Post('register')
  async registerUser(@Body() sys_CreateUserDto: Sys_CreateUserDto) {
    return await this.authService.registerUser(sys_CreateUserDto);
  }

  // @Public()
  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // async login(@Request() req) {
  //   return this.authService.login(
  //     req.user.id,
  //     req.user.name,
  //     req.user.company_id,
  //     req.user.role_id,
  //     req.user.email,
  //     req.user.image,
  //   );
  // }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() body: { email: string; password: string; company_id?: string },
  ) {
    const { email, password, company_id } = body;

    if (!email || !password) {
      throw new UnauthorizedException('Name and password are required');
    }

    return this.authService.login(email, password, company_id);
  }

  @Roles('ADMIN', 'SALESPERSON')
  @Get('protected')
  getAll(@Request() req): string {
    return 'Now you can access this protected API';
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshTokens(@Request() req) {
    return this.authService.refreshToken(req.user.id, req.user.role_id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Request() req, @Res() res: Response) {
    console.log('Google User', req.user);
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Google authentication failed');
    }

    // Ambil role_id dari sys_UserCompanyRole
    const userCompanyRole = await this.authService.getUserCompanyRole(user.id);
    if (!userCompanyRole) {
      throw new UnauthorizedException('User has no company access');
    }

    // Generate tokens
    const tokens = await this.authService.generateTokens(
      user.id,
      userCompanyRole.role_id,
    );

    // Redirect ke frontend
    res.redirect(
      `http://localhost:3000/auth/google/callback?userId=${user.id}&name=${user.name}&accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&role=${userCompanyRole.role_id}`,
    );
  }

  @Post('logout')
  signOut(@Request() req) {
    return this.authService.signOut(req.user.id);
  }
}
