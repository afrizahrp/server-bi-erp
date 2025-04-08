import { Module } from '@nestjs/common';
import { sls_InvoiceDtController } from './sls_InvoiceDt.controller';
import { sls_InvoiceDtService } from './sls_InvoiceDt.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [sls_InvoiceDtController],
  providers: [sls_InvoiceDtService, PrismaService],
  exports: [sls_InvoiceDtService],
})
export class sls_InvoiceDtModule {}
