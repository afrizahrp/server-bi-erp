import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles/role-guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.registerUser(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(
      req.user.id,
      req.user.name,
      req.user.company_id,
      req.user.role_id,
      req.user.email,
      req.user.image,
    );
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getAll(@Request() req): string {
    console.log(req.user);
    return 'Now you can access this protected API';
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshTokens(@Request() req) {
    return this.authService.refreshToken(req.user.id, req.user.name);
  }

  // @UseGuards(RefreshAuthGuard)
  // @Post('refresh')
  // async refreshToken(@Request() req) {
  //   return await this.authService.refreshToken(req.user);
  // }

  @Post('logout')
  signOut(@Request() req) {
    return this.authService.signOut(req.user.id);
  }

  // @Post('login')
  // async loginUser(@Body() dto: LoginDto) {
  //   return await this.authService.login(dto.name, dto.password, dto.company_id);
  // }

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // async login(@Body() loginDto: LoginDto) {
  //   const user = await this.authService.validateLocalUser(
  //     loginDto.name,
  //     loginDto.password,
  //   );
  //   return this.authService.login(
  //     user.id,
  //     user.name,
  //     user.company_id,
  //     user.role_id,
  //   );
  // }
}
