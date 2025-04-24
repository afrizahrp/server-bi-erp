import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { sls_DashboardService } from './sls_dashboard.service';
import { sls_dashboardDto } from './dto/sls_dashboard.dto';

@Controller(':company_id/:module_id/:subModule_id/get-sales-dashboard')
export class sls_DashboardController {
  constructor(private readonly salesDashboardService: sls_DashboardService) {}
  @Public()
  @Get()
  async getSalesDashboard(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: sls_dashboardDto,
  ) {
    // const result = await this.salesDashboardService.getSalesDashboard(
    //   company_id, // Gunakan company_id dari DTO
    //   module_id,
    //   subModule_id,
    //   dto,
    // );
    console.log('Query params received:', JSON.stringify(query)); // Tambah log

    return this.salesDashboardService.getSalesDashboard(
      company_id,
      module_id,
      subModule_id,
      query,
    );
  }
}
