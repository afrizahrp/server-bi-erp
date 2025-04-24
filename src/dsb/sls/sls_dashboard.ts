import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_dashboardDto } from './dto/sls_Dashboard.dto';
import { slsInvoiceHdWherecondition } from 'src/sls/helper/sls_InvoiceHd_wherecondition';

Injectable();
export class SalesDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesDashboard(dto: sls_dashboardDto) {
    const {
      company_id,
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    } = dto;

    // Bangun where condition menggunakan fungsi yang sudah ada
    const whereCondition = slsInvoiceHdWherecondition(
      company_id,
      paginationDto,

      {
        requiredFilters: {
          paidStatus: true,
          poType: true,
          salesPersonName: true,
        },
      },
    );

    // Query untuk mengelompokkan total invoice per bulan
    const salesData = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['invoiceDate'],
      where: whereCondition,
      _sum: {
        total_amount: true,
      },
      orderBy: {
        invoiceDate: 'asc',
      },
    });

    // Format data untuk frontend
    const formattedData = salesData.map((item) => ({
      period: item.invoiceDate,
      totalInvoice: item._sum.total_amount || 0,
    }));

    return formattedData;
  }
}
