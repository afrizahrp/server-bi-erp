import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { sys_UserCompaniesRoleService } from './sys_UserCompaniesRole.service';
import { Sys_CreateUserCompanyRoleDto } from './dto/sys_CreateUserCompanyRole.dto';
import { Sys_UpdateUserCompanyRoleDto } from './dto/sys_UpdateUserCompanyRole.dto';
import { Sys_RemoveUserCompanyRoleDto } from './dto/sys_RemoveUserCompanyRole.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('user-companies-role')
export class UserCompaniesRoleController {
  constructor(
    private readonly userCompaniesRoleService: sys_UserCompaniesRoleService,
  ) {}

  @Roles('ADMIN')
  @Post()
  async addUserToCompany(
    @Body() sys_createUserCompanyDto: Sys_CreateUserCompanyRoleDto,
  ) {
    return this.userCompaniesRoleService.addUserToCompany(
      sys_createUserCompanyDto,
    );
  }

  @Roles('ADMIN')
  @Get(':user_id')
  async getUserCompanies(@Param('user_id') user_id: number) {
    return this.userCompaniesRoleService.getUserCompanies(user_id);
  }

  @Patch()
  async updateUserCompanyRole(
    @Body() sys_UpdateUserCompanyDto: Sys_UpdateUserCompanyRoleDto,
  ) {
    return this.userCompaniesRoleService.updateUserCompanyRole(
      sys_UpdateUserCompanyDto,
    );
  }

  @Delete()
  async removeUserFromCompany(
    @Body() removeUserCompanyDto: Sys_RemoveUserCompanyRoleDto,
  ) {
    return this.userCompaniesRoleService.removeUserFromCompany(
      removeUserCompanyDto,
    );
  }
}
