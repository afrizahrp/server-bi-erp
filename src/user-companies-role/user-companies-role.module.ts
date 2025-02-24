import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserCompaniesRoleService } from './user-companies-role.service';
import { UserCompaniesRoleController } from './user-companies-role.controller';

@Module({
  controllers: [UserCompaniesRoleController],
  providers: [UserCompaniesRoleService, PrismaService],
  exports: [UserCompaniesRoleService], // Jika perlu digunakan di modul lain
})
export class UserCompaniesRoleModule {}
