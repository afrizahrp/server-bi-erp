import { Module } from '@nestjs/common';
import { sls_AnalythicsController } from './sls_analytics.controller';
import { sls_AnalythicsService } from './sls_analytics.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [sls_AnalythicsController],
  providers: [sls_AnalythicsService, PrismaService],
  exports: [sls_AnalythicsService],
})
export class sls_AnalyticsModule {}
