import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_PaginationInvoiceHdDto } from './dto/sls_PaginationInvoiceHd.dto';
import { sls_ResponseInvoiceHdDto } from './dto/sls_ResponseInvoiceHd.dto';
import { sls_ResponseInvoiceHdWithDetailDto } from './dto/sls_ResponseInvoiceDt.dto';
import { getMonthYearPeriod } from 'src/utils/date/getMonthYearPeriod';
import { InvoicePaidStatusEnum } from '@prisma/client';
import { format, isValid } from 'date-fns';

const zone = 'Asia/Jakarta';

@Injectable()
export class sls_InvoiceHdService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    company_id: string,
    module_id: string,
    paginationDto: sls_PaginationInvoiceHdDto,
  ): Promise<{ data: sls_ResponseInvoiceHdDto[]; totalRecords: number }> {
    const {
      page = 1,
      limit = 20,
      startPeriod,
      endPeriod,
      status,
      poType,
      salesPersonName,
      searchBy,
      searchTerm,
    } = paginationDto;

    const safeLimit = Math.min(Number(limit) || 10, 1000);
    const offset = (Number(page) - 1) * safeLimit;

    const whereCondition: Record<string, any> = {
      company_id,
      total_amount: { gt: 10000 },
    };

    // Search
    if (
      searchBy &&
      typeof searchTerm === 'string' &&
      searchTerm.trim() !== ''
    ) {
      const searchWords = searchTerm.trim().split(/\s+/);
      whereCondition.AND = searchWords.map((word) => ({
        [searchBy]: {
          contains: word,
          mode: 'insensitive',
        },
      }));
    }

    // poType filter
    if (poType && poType.length > 0) {
      whereCondition.sls_InvoicePoType = {
        name: {
          contains: poType,
          mode: 'insensitive',
        },
      };
    }

    // Status filter
    if (status) {
      whereCondition.paidStatus = {
        in: status.split(','),
      };
    }

    // Sales person filter
    if (typeof salesPersonName === 'string' && salesPersonName.trim() !== '') {
      const parsedSalesPerson = salesPersonName
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name !== '');

      if (parsedSalesPerson.length > 0) {
        whereCondition.AND = whereCondition.AND || [];
        whereCondition.AND.push({
          OR: parsedSalesPerson.map((name) => ({
            salesPersonName: {
              contains: name,
              mode: 'insensitive',
            },
          })),
        });
      }
    }

    // Gunakan helper untuk invoiceDate
    const { gte, lte } = getMonthYearPeriod(startPeriod, endPeriod);
    if (gte || lte) {
      whereCondition.invoiceDate = {
        ...(gte && { gte }),
        ...(lte && { lte }),
      };
    }

    // Query execution
    const orderField = paginationDto.orderBy ?? 'invoiceDate';
    const orderDirection = paginationDto.orderDir === 'asc' ? 'asc' : 'desc';

    const [totalRecords, invoices] = await Promise.all([
      this.prisma.sls_InvoiceHd.count({ where: whereCondition }),
      this.prisma.sls_InvoiceHd.findMany({
        where: whereCondition,
        skip: offset,
        take: safeLimit,
        include: {
          sls_InvoiceType: true,
          sls_InvoicePoType: true,
        },
        orderBy: {
          [orderField]: orderDirection,
        },
      }),
    ]);

    const formattedInvoices = invoices.map((invoice) =>
      this.mapToResponseDto(invoice),
    );

    return { data: formattedInvoices, totalRecords };
  }

  async findOne(
    company_id: string,
    invoice_id: string,
  ): Promise<sls_ResponseInvoiceHdWithDetailDto> {
    const invoice = await this.prisma.sls_InvoiceHd.findUnique({
      where: { company_id_invoice_id: { company_id, invoice_id } },
      include: {
        sls_InvoiceDt: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoice_id} not found`);
    }

    const header = this.mapToResponseDto(invoice);

    const details = invoice.sls_InvoiceDt.map((dt) => ({
      invoice_id: dt.invoice_id.trim(),
      line_no: dt.line_no,
      product_id: dt.product_id.trim(),
      productName: dt.productName?.trim(),
      uom_id: dt.uom_id.trim(),
      unitPrice: dt.unitPrice ? Number(dt.unitPrice) : 0,
      qty: dt.qty ? Number(dt.qty) : 0,
      sellingPrice: dt.sellingPrice ? Number(dt.sellingPrice) : 0,
      base_amount: dt.base_amount ? Number(dt.base_amount) : 0,
      discount_amount: dt.discount_amount ? Number(dt.discount_amount) : 0,
      delivery_amount: dt.delivery_amount ? Number(dt.delivery_amount) : 0,
      tax_amount: dt.tax_amount ? Number(dt.tax_amount) : 0,
      total_amount: dt.total_amount ? Number(dt.total_amount) : 0,
    }));

    return {
      ...header,
      details,
    };
  }

  async filterBySalesPerson(
    company_id: string,
    module_id: string,
    startPeriod?: string,
    endPeriod?: string,
    poType?: string[],
    paidStatus?: string,
  ): Promise<{ id: string; name: string; count: number }[]> {
    const whereCondition: any = { company_id };

    whereCondition.total_amount = {
      gt: 10000,
    };

    if (poType && poType.length > 0) {
      whereCondition.sls_InvoicePoType = {
        name: {
          in: poType,
          mode: 'insensitive',
        },
      };
    }

    if (paidStatus) {
      whereCondition.paidStatus = {
        in: paidStatus.split(','),
      };
    }

    const { gte, lte } = getMonthYearPeriod(startPeriod, endPeriod);
    if (gte || lte) {
      whereCondition.invoiceDate = {
        ...(gte && { gte }),
        ...(lte && { lte }),
      };
    }

    const salesPersons = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['salesPerson_id'],
      where: whereCondition,
      _count: { _all: true },
    });

    if (!salesPersons || salesPersons.length === 0) {
      throw new NotFoundException(
        `No sales persons found for the given criteria`,
      );
    }

    const salesPersonDetails = await this.prisma.sls_SalesPerson.findMany({
      where: {
        id: {
          in: salesPersons
            .map((s) => s.salesPerson_id)
            .filter((id): id is string => id !== null),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const salesPersonList = salesPersons
      .map((s) => {
        const detail = salesPersonDetails.find(
          (sp) => sp.id === s.salesPerson_id,
        );
        return {
          // id: s.salesPerson_id?.trim(),
          id: detail?.name?.trim() || 'Unknown',
          name: detail?.name?.trim() || 'Unknown',
          count: s._count._all,
        };
      })
      .filter((s) => s.name !== 'Unknown');

    return salesPersonList.sort((a, b) => b.count - a.count);
  }

  async filterByPaidStatus(
    company_id: string,
    module_id: string,
    startPeriod?: string,
    endPeriod?: string,
    poType?: string[],
    salesPersonName?: string[],
  ): Promise<{ id: string; name: string; count: number }[]> {
    const whereCondition: any = {
      company_id,
      total_amount: { gt: 10000 },
      paidStatus: {
        in: [
          InvoicePaidStatusEnum.UNPAID,
          InvoicePaidStatusEnum.PAID,
          InvoicePaidStatusEnum.RETURNED,
        ],
      },
    };

    // poType filter
    if (poType && poType.length > 0) {
      whereCondition.sls_InvoicePoType = {
        name: {
          in: poType,
          mode: 'insensitive',
        },
      };
    }

    // Sales person filter
    if (salesPersonName && salesPersonName.length > 0) {
      whereCondition.OR = salesPersonName.map((name) => ({
        salesPerson: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      }));
    }

    // Gunakan helper untuk invoiceDate
    const { gte, lte } = getMonthYearPeriod(startPeriod, endPeriod);
    if (gte || lte) {
      whereCondition.invoiceDate = {
        ...(gte && { gte }),
        ...(lte && { lte }),
      };
    }

    const statuses = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['paidStatus'],
      where: whereCondition,
      _count: { _all: true },
    });

    if (!statuses || statuses.length === 0) {
      throw new NotFoundException(`No statuses found for the given criteria`);
    }

    const statusPriority = {
      UNPAID: 0,
      PAID: 1,
      RETURNED: 4,
      OTHER: 3,
    };

    const sortedStatuses = statuses.sort((a, b) => {
      const aPriority = statusPriority[a.paidStatus] ?? statusPriority.OTHER;
      const bPriority = statusPriority[b.paidStatus] ?? statusPriority.OTHER;
      return aPriority - bPriority;
    });

    return sortedStatuses.map((s) => ({
      id: s.paidStatus,
      name: this.getPaidStatusName(s.paidStatus),
      count: s._count._all,
    }));
  }

  private getPaidStatusName(paidStatus: string): string {
    const paidStatusMap: Record<string, string> = {
      UNPAID: 'UNPAID',
      PAID: 'PAID',
      RETURNED: 'RETURNED',
    };

    return paidStatusMap[paidStatus] || 'Unknown';
  }

  async filterByPoType(
    company_id: string,
    module_id: string,
    startPeriod?: string,
    endPeriod?: string,
    paidStatus?: string | string[], // Accepts either a string or an array of strings
    salesPersonName?: string[],
  ): Promise<{ id: string; name: string; count: number }[]> {
    const whereCondition: any = { company_id };

    whereCondition.total_amount = {
      gt: 10000, // 'gt' berarti 'greater than'
    };

    if (paidStatus) {
      // Cek apakah paidStatus berupa string, jika iya, pisahkan dengan split
      whereCondition.paidStatus = Array.isArray(paidStatus)
        ? { in: paidStatus } // Jika sudah array, langsung pakai
        : { in: paidStatus.split(',') }; // Jika string, split jadi array
    }

    // Sales person filter
    if (salesPersonName && salesPersonName.length > 0) {
      whereCondition.salesPerson = {
        name: {
          contains: salesPersonName.join(','),
          mode: 'insensitive',
        },
      };
    }

    // Gunakan helper untuk invoiceDate
    const { gte, lte } = getMonthYearPeriod(startPeriod, endPeriod);
    if (gte || lte) {
      whereCondition.invoiceDate = {
        ...(gte && { gte }),
        ...(lte && { lte }),
      };
    }

    const poTypes = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['poType_id'],
      where: whereCondition,
      _count: { _all: true },
    });

    if (!poTypes || poTypes.length === 0) {
      throw new NotFoundException(
        `No sales persons found for the given criteria`,
      );
    }

    const invoicePoTypes = await this.prisma.sls_InvoicePoType.findMany({
      where: {
        id: {
          in: poTypes.map((s) => s.poType_id).filter((id) => id !== null),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const poTypeList = poTypes
      .map((s) => {
        const detail = invoicePoTypes.find((sp) => sp.id === s.poType_id);
        return {
          id: detail?.name?.trim() || 'Unknown',
          name: detail?.name?.trim() || 'Unknown',
          count: s._count._all, // Langsung return number
        };
      })
      .filter((s) => s.name !== 'Unknown'); // Hapus data dengan name "Unknown"

    // Urutkan berdasarkan count secara descending
    return poTypeList.sort((a, b) => b.count - a.count);
  }

  private mapToResponseDto(invoice: any): sls_ResponseInvoiceHdDto {
    return {
      poType_id: invoice.poType,
      invoiceType_id: invoice.invoiceType,
      poType: invoice.po_id?.trim() // Periksa apakah po_id tidak kosong
        ? (invoice.sls_InvoicePoType?.name ?? undefined)
        : undefined, // Hanya tampilkan poType jika po_id tidak kosong
      invoiceType: invoice.sls_InvoiceType?.name ?? undefined,
      ecatalog_id: invoice.ecatalog_id?.trim() ?? undefined,
      po_id:
        invoice.poType_id === 1 && invoice.company_id !== 'BIS' // Tambahkan kondisi baru
          ? (invoice.ecatalog_id?.trim() ?? '') // Jika poType_id = 1 dan company_id <> 'BIS', gunakan ecatalog_id
          : invoice.company_id !== 'BIS'
            ? (invoice.ecatalog_id?.trim() ?? '') // Jika company_id <> 'BIS', gunakan ecatalog_id
            : (invoice.po_id?.trim() ?? ''), // Jika tidak, gunakan po_id
      invoice_id: invoice.invoice_id.trim(),
      invoiceDate: invoice.invoiceDate,
      ref_id: invoice.ref_id?.trim() ?? '',
      tax_id: invoice.tax_id?.trim() ?? '',
      taxRate: invoice.taxRate,
      debtor_id: invoice.debtor_id.trim() ?? undefined,
      debtorName: invoice.debtorName.trim() ?? undefined,
      customer_id: invoice.customer_id.trim() ?? undefined,
      customerName: invoice.customerName?.trim() ?? '',
      creditTerms: invoice.creditTerms,
      dueDate: invoice.dueDate,
      salesPerson_id: invoice.salesPerson_id.trim() ?? '',
      salesPersonName: invoice.salesPersonName.trim() ?? '',
      base_amount: invoice.base_amount,
      dp_amount: invoice.dp_amount,
      discount_amount: invoice.discount_amount,
      totalDiscount_amount: invoice.totalDiscount_amount,
      tax_amount: invoice.tax_amt,
      totalDelivery_amount: invoice.totalDelivery_amount,
      total_amount: invoice.total_amount,
      paidStatus: invoice.paidStatus,
      monthYear:
        invoice.invoiceDate && isValid(invoice.invoiceDate)
          ? format(invoice.invoiceDate, 'MMM yyyy', {
              useAdditionalWeekYearTokens: false,
            })
          : 'N/A', // Penanganan untuk invoiceDate null atau tidak valid
    };
  }
}
