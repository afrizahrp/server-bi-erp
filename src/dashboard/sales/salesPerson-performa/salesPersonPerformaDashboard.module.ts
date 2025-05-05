import { Module } from '@nestjs/common';
import { salesPersonPerformaDashboardController } from './salesPersonPerformaDashboardController';
import { salesPersonPerformaDashboardService } from './salesPersonPerformaDashboardService';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [salesPersonPerformaDashboardController],
  providers: [salesPersonPerformaDashboardService, PrismaService],
  exports: [salesPersonPerformaDashboardService],
})
export class salesPersonPerformaDashboardModule {}
