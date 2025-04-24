import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_PaginationInvoiceHdDto } from './dto/sls_PaginationInvoiceHd.dto';
import { sls_ResponseInvoiceHdDto } from './dto/sls_ResponseInvoiceHd.dto';
import { sls_ResponseInvoiceHdWithDetailDto } from './dto/sls_ResponseInvoiceDt.dto';
import { slsInvoiceHdWherecondition } from '../helper/sls_InvoiceHd_wherecondition';
import { buildSearchCondition } from 'src/utils/query-operator/buildSearchConditon';
import { sortFieldBy } from 'src/utils/query-operator/sortFieldBy';
import { SlsInvoiceFilter } from '../helper/sls_filter';

@Injectable()
export class sls_InvoiceHdService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    company_id: string,
    module_id: string,
    paginationDto: sls_PaginationInvoiceHdDto,
  ): Promise<{
    data: sls_ResponseInvoiceHdDto[];
    grandTotal_amount: number;
    totalRecords: number;
  }> {
    const {
      page = 1,
      limit = 20,
      searchBy,
      searchTerm,
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    } = paginationDto;

    const allowedSortFields = [
      'invoice_id',
      'invoiceDate',
      'customerName',
      'po_id',
      'poType_id',
      'salesPersonName',
      'total_amount',
      'paidStatus_id',
    ];

    // const searchCondition = buildSearchCondition(searchBy, searchTerm);
    const orderByCondition = sortFieldBy(
      allowedSortFields,
      paginationDto.orderBy,
      paginationDto.orderDir,
    );

    const safeLimit = Math.min(Number(limit) || 10, 100);
    const offset = (Number(page) - 1) * safeLimit;

    const filter: SlsInvoiceFilter = {
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    };

    const whereCondition = slsInvoiceHdWherecondition(company_id, filter, {
      requiredFilters: {
        paidStatus: true,
        poType: true,
        salesPersonName: true,
      },
    });

    const searchConditions = buildSearchCondition(searchBy, searchTerm);
    if (searchConditions) {
      if (whereCondition.AND) {
        whereCondition.AND = [...whereCondition.AND, ...searchConditions];
      } else {
        whereCondition.AND = searchConditions;
      }
    }

    console.log('whereCondition', whereCondition);
    // Jalankan query count, findMany, dan aggregate secara paralel
    const [totalRecords, invoices, aggregate] = await Promise.all([
      this.prisma.sls_InvoiceHd.count({ where: whereCondition }),
      this.prisma.sls_InvoiceHd.findMany({
        where: whereCondition,
        orderBy: orderByCondition,
        skip: offset,
        take: safeLimit,
        include: {
          sys_PaidStatus: true,
          sls_InvoicePoType: true,
          salesPerson: true,
          customer: true,
        },
      }),
      this.prisma.sls_InvoiceHd.aggregate({
        _sum: {
          total_amount: true, // Agregasi total_amount
        },
        where: whereCondition,
      }),
    ]);

    const formattedInvoices = invoices.map((invoice) =>
      this.mapToResponseDto(invoice),
    );

    return {
      data: formattedInvoices,
      grandTotal_amount: aggregate._sum.total_amount?.toNumber() || 0, // Return total_amount as grandTotal_amount
      totalRecords,
    };
  }

  async filterByPaidStatus(
    company_id: string,
    module_id: string,
    paginationDto: sls_PaginationInvoiceHdDto,
  ): Promise<{
    data: { id: string; name: string; count: number }[];
    totalRecords: number;
  }> {
    const {
      page = 1,
      limit = 20,
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    } = paginationDto;

    const safeLimit = Math.min(Number(limit) || 10, 100);
    const offset = (Number(page) - 1) * safeLimit;

    const filter: SlsInvoiceFilter = {
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    };

    const whereCondition = slsInvoiceHdWherecondition(company_id, filter, {
      requiredFilters: {
        paidStatus: false,
        poType: true,
        salesPersonName: true,
      },
    });

    const paidStatusData = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['paidStatus_id'],
      where: whereCondition,
      _count: {
        _all: true,
      },
    });

    // Ambil semua paidStatus_id yang digunakan
    const paidStatusIds = paidStatusData.map((item) => item.paidStatus_id);

    // Ambil nama paid status dari table master
    const paidStatusDetails = await this.prisma.sys_PaidStatus.findMany({
      where: {
        id: { in: paidStatusIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Buat mapping cepat dari id -> name
    const paidStatusMap = new Map(
      paidStatusDetails.map((ps) => [ps.id, ps.name.trim()]),
    );

    const formattedData = paidStatusData
      .map((item) => {
        const name =
          paidStatusMap.get(item.paidStatus_id) ||
          item.paidStatus_id?.toString();
        return {
          id: name.toString(),
          name: name.toString(),
          count: item._count._all,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(offset, offset + safeLimit);

    const totalRecords = paidStatusData.length;

    return { data: formattedData, totalRecords };
  }

  async filterBySalesPersonName(
    company_id: string,
    module_id: string,
    paginationDto: sls_PaginationInvoiceHdDto,
  ): Promise<{
    data: { id: string; name: string; count: number }[];
    totalRecords: number;
  }> {
    const {
      page = 1,
      limit = 20,
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    } = paginationDto;

    const safeLimit = Math.min(Number(limit) || 10, 100);
    const offset = (Number(page) - 1) * safeLimit;

    const filter: SlsInvoiceFilter = {
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    };

    const whereCondition = slsInvoiceHdWherecondition(company_id, filter, {
      requiredFilters: {
        paidStatus: true,
        poType: true,
        salesPersonName: false,
      },
    });

    // Query untuk agregasi tanpa skip, take, atau orderBy
    const salesPersonData = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['salesPersonName'],
      where: whereCondition,
      _count: {
        _all: true,
      },
    });

    // Format hasil, urutkan, dan terapkan paginasi
    const formattedData = salesPersonData
      .map((item, index) => ({
        id: `${item.salesPersonName.trim()}`, // Sesuaikan jika ada kolom ID
        name: item.salesPersonName.trim(),
        count: item._count._all,
      }))
      .sort((a, b) => b.count - a.count) // Urutkan descending berdasarkan count
      .slice(offset, offset + safeLimit); // Terapkan paginasi di aplikasi

    // Hitung total records
    const totalRecords = salesPersonData.length;

    return { data: formattedData, totalRecords };
  }

  async filterByPoType(
    company_id: string,
    module_id: string,
    paginationDto: sls_PaginationInvoiceHdDto,
  ): Promise<{
    data: { id: string; name: string; count: number }[];
    totalRecords: number;
  }> {
    const {
      page = 1,
      limit = 20,
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    } = paginationDto;

    const safeLimit = Math.min(Number(limit) || 10, 100);
    const offset = (Number(page) - 1) * safeLimit;

    const filter: SlsInvoiceFilter = {
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    };

    const whereCondition = slsInvoiceHdWherecondition(company_id, filter, {
      requiredFilters: {
        paidStatus: true,
        poType: true,
        salesPersonName: false,
      },
    });

    const poTypeData = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['poType_id'],
      where: whereCondition,
      _count: {
        _all: true,
      },
    });

    // Ambil semua poType_id yang digunakan
    const poTypeIds = poTypeData.map((item) => item.poType_id);

    // Ambil nama poType dari table master
    const poTypeDetails = await this.prisma.sls_InvoicePoType.findMany({
      where: {
        id: { in: poTypeIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Mapping relasi id -> name
    const poTypeMap = new Map(
      poTypeDetails.map((pt) => [pt.id, pt.name.trim()]),
    );

    const formattedData = poTypeData
      .map((item) => {
        const name = poTypeMap.get(item.poType_id) || item.poType_id; // fallback ke ID kalau aneh
        return {
          id: name.toString(),
          name: name.toString(),
          count: item._count._all,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(offset, offset + safeLimit);

    const totalRecords = poTypeData.length;

    return { data: formattedData, totalRecords };
  }

  async findOne(
    company_id: string,
    invoice_id: string,
  ): Promise<sls_ResponseInvoiceHdWithDetailDto> {
    const invoice = await this.prisma.sls_InvoiceHd.findUnique({
      where: { company_id_invoice_id: { company_id, invoice_id } },
      include: {
        sls_InvoiceDt: true,
        salesPerson: true,
        sys_PaidStatus: true,
        sls_InvoicePoType: true,
        customer: true,
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

  private mapToResponseDto(invoice: any): sls_ResponseInvoiceHdDto {
    return {
      poType_id: invoice.poType,
      invoiceType_id: invoice.invoiceType,
      poType: invoice.po_id?.trim() // Periksa apakah po_id tidak kosong
        ? (invoice.sls_InvoicePoType?.name ?? undefined)
        : undefined, // Hanya tampilkan poType jika po_id tidak kosong
      invoiceType: invoice.sls_InvoiceType?.name ?? undefined,
      ecatalog_id: invoice.ecatalog_id?.trim() ?? undefined,
      po_id: invoice.po_id?.trim() ?? '',
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
      salesPersonName: invoice.salesPerson?.name.trim() ?? '',
      base_amount: invoice.base_amount,
      dp_amount: invoice.dp_amount,
      discount_amount: invoice.discount_amount,
      totalDiscount_amount: invoice.totalDiscount_amount,
      tax_amount: invoice.tax_amt,
      totalDelivery_amount: invoice.totalDelivery_amount,
      total_amount: invoice.total_amount,
      paidStatus: invoice.sys_PaidStatus.name.trim() ?? undefined,
      grandTotal_amount: invoice.grandTotal_amount,
    };
  }
}
