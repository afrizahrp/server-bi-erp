import { Module } from '@nestjs/common';
import { salesInvoiceAnalyticsController } from './salesInvoiceAnalytics.controller';
import { salesInvoiceAnalyticsService } from './salesInvoiceAnalytics.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [salesInvoiceAnalyticsController],
  providers: [salesInvoiceAnalyticsService, PrismaService],
  exports: [salesInvoiceAnalyticsService],
})
export class salesInvoiceAnalyticsModule {}
