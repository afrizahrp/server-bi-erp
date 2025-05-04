import { Module } from '@nestjs/common';
import { salesInvoiceHdController } from './salesInvoiceHd.controller';
import { salesInvoiceHdService } from './salesInvoiceHd.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [salesInvoiceHdController],
  providers: [salesInvoiceHdService, PrismaService],
  exports: [salesInvoiceHdService],
})
export class salesInvoiceHdModule {}
