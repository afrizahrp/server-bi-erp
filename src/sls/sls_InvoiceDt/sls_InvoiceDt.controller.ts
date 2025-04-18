// src/sls_InvoiceDt/sls_InvoiceDt.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { sls_InvoiceDtService } from './sls_InvoiceDt.service';
import { sls_ResponseInvoiceDtDto } from './dto/sls_ResponseInvoiceDt.dto';

@Controller(':company_id/get-invoiceDt')
export class sls_InvoiceDtController {
  constructor(private readonly invoiceDtService: sls_InvoiceDtService) {}

  @Public()
  @Get(':id')
  async findByInvoiceId(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<sls_ResponseInvoiceDtDto[]> {
    return this.invoiceDtService.findByInvoiceId(company_id, id);
  }
}
