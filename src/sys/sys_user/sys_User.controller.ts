import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { sys_UserService } from './sys_User.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/role-guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('user')
export class sys_UserController {
  constructor(private readonly sys_userService: sys_UserService) {}

  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @Get(':id')
  async getUserProfile(@Param('id') id: number) {
    return await this.sys_userService.findById(id);
  }
}
