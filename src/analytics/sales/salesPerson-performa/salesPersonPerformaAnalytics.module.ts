import { Module } from '@nestjs/common';
import { salesPersonPerformaAnalyticsController } from './salesPersonPerformaAnalyticsController';
import { salesPersonPerformaAnalyticsService } from './salesPersonPerformaAnalyticsService';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [salesPersonPerformaAnalyticsController],
  providers: [salesPersonPerformaAnalyticsService, PrismaService],
  exports: [salesPersonPerformaAnalyticsService],
})
export class salesPersonPerformaAnalyticsModule {}
