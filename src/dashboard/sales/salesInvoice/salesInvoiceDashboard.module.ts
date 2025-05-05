import { Module } from '@nestjs/common';
import { salesInvoiceDashboardController } from './salesInvoiceDashboard.controller';
import { salesInvoiceDashboardService } from './salesInvoiceDashboard.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [salesInvoiceDashboardController],
  providers: [salesInvoiceDashboardService, PrismaService],
  exports: [salesInvoiceDashboardService],
})
export class salesInvoiceDashboardModule {}
