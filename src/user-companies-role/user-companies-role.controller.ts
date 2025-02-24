import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { UserCompaniesRoleService } from './user-companies-role.service';
import { CreateUserCompanyRoleDto } from './dto/create-user-company-role.dto';
import { UpdateUserCompanyRoleDto } from './dto/update-user-company-role.dto';
import { RemoveUserCompanyRoleDto } from './dto/remove-user-company-role.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('user-companies-role')
export class UserCompaniesRoleController {
  constructor(
    private readonly userCompaniesRoleService: UserCompaniesRoleService,
  ) {}

  @Roles(1, 3)
  @Post()
  async addUserToCompany(
    @Body() createUserCompanyDto: CreateUserCompanyRoleDto,
  ) {
    return this.userCompaniesRoleService.addUserToCompany(
      createUserCompanyDto.user_id,
      createUserCompanyDto.company_id,
      createUserCompanyDto.branch_id,
      createUserCompanyDto.role_id,
    );
  }

  @Get(':user_id')
  async getUserCompanies(@Param('user_id') user_id: number) {
    return this.userCompaniesRoleService.getUserCompanies(user_id);
  }

  @Patch()
  async updateUserCompanyRole(
    @Body() updateUserCompanyDto: UpdateUserCompanyRoleDto,
  ) {
    return this.userCompaniesRoleService.updateUserCompanyRole(
      updateUserCompanyDto.user_id,
      updateUserCompanyDto.company_id,
      updateUserCompanyDto.branch_id,
      updateUserCompanyDto.role_id,
    );
  }

  @Delete()
  async removeUserFromCompany(
    @Body() removeUserCompanyDto: RemoveUserCompanyRoleDto,
  ) {
    return this.userCompaniesRoleService.removeUserFromCompany(
      removeUserCompanyDto.user_id,
      removeUserCompanyDto.company_id,
      removeUserCompanyDto.branch_id,
    );
  }
}
