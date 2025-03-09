import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { sys_UserCompanyRoleService } from './sys_UserCompanyRole.service';
import { Sys_CreateUserCompanyRoleDto } from './dto/sys_CreateUserCompanyRole.dto';
import { Sys_UpdateUserCompanyRoleDto } from './dto/sys_UpdateUserCompanyRole.dto';
import { Sys_RemoveUserCompanyRoleDto } from './dto/sys_RemoveUserCompanyRole.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('sys/usercompaniesrole')
export class sys_UserCompanyRoleController {
  constructor(
    private readonly sys_userCompanyRoleService: sys_UserCompanyRoleService,
  ) {}

  @Roles('ADMIN')
  // @Public()
  @Post()
  async addUserToCompany(
    @Body() sys_createUserCompanyRoleDto: Sys_CreateUserCompanyRoleDto,
  ) {
    return this.sys_userCompanyRoleService.addUserToCompany(
      sys_createUserCompanyRoleDto,
    );
  }

  @Roles('ADMIN')
  @Get(':user_id')
  async getUserCompanies(@Param('user_id') user_id: number) {
    return this.sys_userCompanyRoleService.getUserCompanies(user_id);
  }

  @Patch()
  async updateUserCompanyRole(
    @Body() sys_UpdateUserCompanyRoleDto: Sys_UpdateUserCompanyRoleDto,
  ) {
    return this.sys_userCompanyRoleService.updateUserCompanyRole(
      sys_UpdateUserCompanyRoleDto,
    );
  }

  @Delete()
  async removeUserFromCompany(
    @Body() sys_RemoveUserCompanyRoleDto: Sys_RemoveUserCompanyRoleDto,
  ) {
    return this.sys_userCompanyRoleService.removeUserFromCompany(
      sys_RemoveUserCompanyRoleDto,
    );
  }
}
