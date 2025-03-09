import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Sys_CompanyService } from './sys_Company.service';
import { sys_CompanyController } from './sys_Company.controller';

@Module({
  controllers: [sys_CompanyController],
  providers: [Sys_CompanyService, PrismaService],
})
export class sys_CompanyModule {}
