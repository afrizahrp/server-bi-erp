import { Module } from '@nestjs/common';
import { sls_DashboardController } from './sls_dashboard.controller';
import { sls_DashboardService } from './sls_dashboard.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [sls_DashboardController],
  providers: [sls_DashboardService, PrismaService],
  exports: [sls_DashboardService],
})
export class sls_DashboardModule {}
