import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  UnauthorizedException,
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
  @Post('login')
  async login(
    @Body() body: { name: string; password: string; company_id?: string },
  ) {
    const { name, password, company_id } = body;

    if (!name || !password) {
      throw new UnauthorizedException('Name and password are required');
    }

    return this.authService.login(name, password, company_id);
  }

  @Roles(1)
  @Get('protected')
  getAll(@Request() req): string {
    console.log(req.user);
    return 'Now you can access this protected API';
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshTokens(@Request() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @Post('logout')
  signOut(@Request() req) {
    return this.authService.signOut(req.user.id);
  }
}
