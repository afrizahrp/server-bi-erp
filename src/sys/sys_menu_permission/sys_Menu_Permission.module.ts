import { Module } from '@nestjs/common';
import { sys_MenuPermissionService } from './sys_Menu_Permission.service';
import { sys_MenuPermissionController } from './sys_Menu_Permission.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [sys_MenuPermissionController],
  providers: [sys_MenuPermissionService, PrismaService],
})
export class sys_MenuPermissionModule {}
