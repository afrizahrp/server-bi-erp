import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { paginationSalesInvoiceHdDto } from './dto/paginationSalesInvoiceHd.dto';
import { responseSalesInvoiceHdDto } from './dto/responseSalesInvoiceHd';
import { salesInvoiceHdService } from './salesInvoiceHd.service';
import { responseSalesInvoiceHdWithItemdDto } from './dto/responseSalesInvoiceHdWithItem.dto';

@Controller('SLS/get-invoiceHd')
export class salesInvoiceHdController {
  constructor(private readonly salesInvoiceHdService: salesInvoiceHdService) {}

  @Public()
  @Get()
  async findAll(@Query() query: paginationSalesInvoiceHdDto) {
    const { company_id, ...restQuery } = query;

    if (!company_id || !Array.isArray(company_id) || company_id.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    const module_id = 'SLS';

    const rawData = await this.salesInvoiceHdService.findAll(module_id, {
      company_id,
      ...restQuery,
    });

    return rawData ?? { data: [], totalRecords: 0 };
  }

  @Public()
  @Get('detail/:id')
  async findOne(
    @Query('company_id') company_id: string,
    @Param('id') invoice_id: string,
  ): Promise<responseSalesInvoiceHdWithItemdDto> {
    if (!company_id) {
      throw new BadRequestException('company_id is required');
    }
    return this.salesInvoiceHdService.findOne('SLS', company_id, invoice_id);
  }

  @Public()
  @Get('getPaidStatus')
  async getPaidStatus(@Query() query: paginationSalesInvoiceHdDto) {
    const { company_id, ...restQuery } = query;

    if (!company_id || !Array.isArray(company_id) || company_id.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    const module_id = 'SLS';

    const rawData = await this.salesInvoiceHdService.filterByPaidStatus(
      module_id,
      {
        company_id,
        ...restQuery,
      },
    );

    return rawData ?? { data: [], totalRecords: 0 };
  }

  @Public()
  @Get('getPoType')
  async getPoType(@Query() query: paginationSalesInvoiceHdDto) {
    const { company_id, ...restQuery } = query;

    if (!company_id || !Array.isArray(company_id) || company_id.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    const module_id = 'SLS';

    const rawData = await this.salesInvoiceHdService.filterByPoType(module_id, {
      company_id,
      ...restQuery,
    });

    return rawData ?? { data: [], totalRecords: 0 };
  }

  @Public()
  @Get('getSalesPerson')
  async getSalesPerson(@Query() query: paginationSalesInvoiceHdDto) {
    const { company_id, ...restQuery } = query;

    if (!company_id || !Array.isArray(company_id) || company_id.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    const module_id = 'SLS';

    const rawData = await this.salesInvoiceHdService.filterBySalesPersonName(
      module_id,
      { company_id, ...restQuery },
    );

    return rawData ?? { data: [], totalRecords: 0 };
  }
}
