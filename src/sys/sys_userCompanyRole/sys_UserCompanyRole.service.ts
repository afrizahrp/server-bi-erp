import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Sys_CreateUserCompanyRoleDto } from './dto/sys_CreateUserCompanyRole.dto';
import { Sys_UpdateUserCompanyRoleDto } from './dto/sys_UpdateUserCompanyRole.dto';
import { Sys_RemoveUserCompanyRoleDto } from './dto/sys_RemoveUserCompanyRole.dto';
import { Sys_ResponseUserCompanyRoleDto } from './dto/sys_ResponseUserCompanyRole.dto';

@Injectable()
export class sys_UserCompanyRoleService {
  constructor(private readonly prisma: PrismaService) {}

  async addUserToCompany(
    sys_CreateUserCompanyRoleDto: Sys_CreateUserCompanyRoleDto,
  ): Promise<Sys_ResponseUserCompanyRoleDto> {
    const { user_id, company_id, branch_id, role_id } =
      sys_CreateUserCompanyRoleDto;
    const userCompanyRole = await this.prisma.sys_UserCompanyRole.create({
      data: {
        user_id,
        company_id,
        branch_id,
        role_id,
        isDefault: false,
      },
    });
    return userCompanyRole as Sys_ResponseUserCompanyRoleDto;
  }

  async getUserCompanies(
    userId: number,
  ): Promise<Sys_ResponseUserCompanyRoleDto[]> {
    const userCompanies = await this.prisma.sys_UserCompanyRole.findMany({
      where: { user_id: userId },
      include: { role: true, user: true },
    });
    return userCompanies as Sys_ResponseUserCompanyRoleDto[];
  }

  async updateUserCompanyRole(
    sys_UpdateUserCompanyRoleDto: Sys_UpdateUserCompanyRoleDto,
  ): Promise<Sys_ResponseUserCompanyRoleDto> {
    const { user_id, company_id, branch_id, role_id } =
      sys_UpdateUserCompanyRoleDto;
    const updatedUserCompanyRole = await this.prisma.sys_UserCompanyRole.update(
      {
        where: {
          user_id_company_id_branch_id: {
            user_id,
            company_id,
            branch_id,
          },
        },
        data: { role_id },
      },
    );
    return updatedUserCompanyRole as Sys_ResponseUserCompanyRoleDto;
  }

  async removeUserFromCompany(
    sys_RemoveUserCompanyRoleDto: Sys_RemoveUserCompanyRoleDto,
  ): Promise<void> {
    const { user_id, company_id, branch_id } = sys_RemoveUserCompanyRoleDto;
    await this.prisma.sys_UserCompanyRole.deleteMany({
      where: { user_id, company_id, branch_id },
    });
  }
}
