// src/sls_InvoiceDt/sls_InvoiceDt.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { salesInvoiceItemService } from './salesInvoiceItem.service';
import { responseSalesInvoiceItemDto } from './dto/responseSalesInvoiceItem.dto';

// @Controller(':company_id/get-invoiceDt')
@Controller(':company_id/:module_id/get-invoiceDt')
export class salesInvoiceItemContoller {
  constructor(private readonly invoiceDtService: salesInvoiceItemService) {}

  @Public()
  @Get(':id')
  async findByInvoiceId(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<responseSalesInvoiceItemDto[]> {
    return this.invoiceDtService.findByInvoiceId(company_id, id);
  }
}
