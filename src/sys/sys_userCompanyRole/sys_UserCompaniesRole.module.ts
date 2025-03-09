import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sys_UserCompanyRoleService } from './sys_UserCompanyRole.service';
import { sys_UserCompanyRoleController } from './sys_UserCompanyRole.controller';

@Module({
  controllers: [sys_UserCompanyRoleController],
  providers: [sys_UserCompanyRoleService, PrismaService],
  exports: [sys_UserCompanyRoleService], // Jika perlu digunakan di modul lain
})
export class sys_UserCompanyRoleModule {}
