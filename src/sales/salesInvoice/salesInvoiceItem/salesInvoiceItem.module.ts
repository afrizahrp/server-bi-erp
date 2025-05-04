import { Module } from '@nestjs/common';
import { salesInvoiceItemContoller } from './salesInvoiceItem.contoller';
import { salesInvoiceItemService } from './salesInvoiceItem.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [salesInvoiceItemContoller],
  providers: [salesInvoiceItemService, PrismaService],
  exports: [salesInvoiceItemService],
})
export class salesInvoiceItemModule {}
