import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserCompaniesRoleService {
  constructor(private readonly prisma: PrismaService) {}

  async addUserToCompany(
    userId: number,
    company_id: string,
    branch_id: string,
    role_id: number,
  ) {
    return await this.prisma.sys_UserCompaniesRole.create({
      data: {
        user_id: userId,
        company_id,
        branch_id,
        role_id,
      },
    });
  }

  async getUserCompanies(userId: number) {
    return await this.prisma.sys_UserCompaniesRole.findMany({
      where: { user_id: userId },
      include: { role: true, user: true },
    });
  }

  async updateUserCompanyRole(
    userId: number,
    company_id: string,
    branch_id: string,
    role_id: number,
  ) {
    return await this.prisma.sys_UserCompaniesRole.updateMany({
      where: { user_id: userId, company_id, branch_id },
      data: { role_id },
    });
  }

  async removeUserFromCompany(
    userId: number,
    company_id: string,
    branch_id: string,
  ) {
    return await this.prisma.sys_UserCompaniesRole.deleteMany({
      where: { user_id: userId, company_id, branch_id },
    });
  }
}
