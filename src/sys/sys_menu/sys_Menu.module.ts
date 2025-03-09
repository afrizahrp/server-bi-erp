import { Module } from '@nestjs/common';
import { sys_MenuService } from './sys_Menu.service';
import { sys_MenuController } from './sys_Menu.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [sys_MenuController],
  providers: [sys_MenuService, PrismaService],
})
export class sys_MenuModule {}
