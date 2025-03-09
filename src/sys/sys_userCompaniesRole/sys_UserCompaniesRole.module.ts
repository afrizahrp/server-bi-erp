import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sys_UserCompaniesRoleService } from './sys_UserCompaniesRole.service';
import { UserCompaniesRoleController } from './sys_UserCompaniesrRole.controller';

@Module({
  controllers: [UserCompaniesRoleController],
  providers: [sys_UserCompaniesRoleService, PrismaService],
  exports: [sys_UserCompaniesRoleService], // Jika perlu digunakan di modul lain
})
export class sys_UserCompaniesRoleModule {}
