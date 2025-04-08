import { Module } from '@nestjs/common';
import { sls_InvoiceHdController } from './sls_InvoiceHd.controller';
import { sls_InvoiceHdService } from './sls_InvoiceHd.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [sls_InvoiceHdController],
  providers: [sls_InvoiceHdService, PrismaService],
  exports: [sls_InvoiceHdService],
})
export class sls_InvoiceHdModule {}
