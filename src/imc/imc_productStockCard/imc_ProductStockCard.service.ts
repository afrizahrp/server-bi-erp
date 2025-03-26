import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Imc_CreateProductStockCardDto } from './dto/imc_CreateProductStockCard.dto';
import { Imc_UpdateProductStockCardDto } from './dto/imc_UpdateProductStockCard.dto';
import { Imc_ResponseProductStockCardDto } from './dto/imc_ResponseProductStockCard.dto';

@Injectable()
export class imc_ProductStockCardService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDto: Imc_CreateProductStockCardDto,
  ): Promise<Imc_ResponseProductStockCardDto> {
    const stockCard = await this.prisma.imc_ProductStockCard.create({
      data: {
        ...createDto,
        updatedAt: createDto.updatedAt ?? new Date(),
      },
    });
    return this.mapToResponseDto(stockCard);
  }

  async findAll(
    company_id: string,
    paginationDto: { page?: number; limit?: number },
  ): Promise<{
    data: Imc_ResponseProductStockCardDto[];
    totalRecords: number;
  }> {
    const { page = 1, limit = 100 } = paginationDto;

    const whereCondition = { company_id };

    // Hitung total data sebelum pagination
    const totalRecords = await this.prisma.imc_ProductStockCard.count({
      where: whereCondition,
    });
    const skip = Math.min((page - 1) * limit, totalRecords);

    console.log('whereCondition:', whereCondition);
    console.log('skip:', skip);
    console.log('take:', limit);

    const stockCards = await this.prisma.imc_ProductStockCard.findMany({
      where: whereCondition,
      skip,
      take: limit,
    });

    // Format hasil agar sesuai DTO
    const formattedStockCards = stockCards.map(this.mapToResponseDto);

    return { data: formattedStockCards, totalRecords };
  }

  async findOne(
    company_id: string,
    product_id: string,
    doc_id: string,
  ): Promise<Imc_ResponseProductStockCardDto> {
    const stockCard = await this.prisma.imc_ProductStockCard.findUnique({
      where: {
        product_id_floor_id_shelf_id_row_id_mExpired_dt_yExpired_dt_doc_id_mutation_id_srn_seq_warehouse_id_company_id:
          {
            product_id,
            floor_id: 'default_floor_id',
            shelf_id: 'default_shelf_id',
            row_id: 'default_row_id',
            mExpired_dt: 'default_mExpired_dt',
            yExpired_dt: 'default_yExpired_dt',
            doc_id,
            mutation_id: 'default_mutation_id',
            srn_seq: 0,
            warehouse_id: 'default_warehouse_id',
            company_id: 'default_company_id',
          },
      },
    });
    if (!stockCard) {
      throw new NotFoundException(
        `Stock card with product_id ${product_id} and doc_id ${doc_id} not found`,
      );
    }
    return this.mapToResponseDto(stockCard);
  }

  async update(
    company_id: string,
    product_id: string,
    doc_id: string,
    updateDto: Imc_UpdateProductStockCardDto,
  ): Promise<Imc_ResponseProductStockCardDto> {
    const stockCard = await this.prisma.imc_ProductStockCard.findUnique({
      where: {
        product_id_floor_id_shelf_id_row_id_mExpired_dt_yExpired_dt_doc_id_mutation_id_srn_seq_warehouse_id_company_id:
          {
            product_id,
            floor_id: 'default_floor_id',
            shelf_id: 'default_shelf_id',
            row_id: 'default_row_id',
            mExpired_dt: 'default_mExpired_dt',
            yExpired_dt: 'default_yExpired_dt',
            doc_id,
            mutation_id: 'default_mutation_id',
            srn_seq: 0,
            warehouse_id: 'default_warehouse_id',
            company_id: 'default_company_id',
          },
      },
    });
    if (!stockCard) {
      throw new NotFoundException(
        `Stock card with product_id ${product_id} and doc_id ${doc_id} not found`,
      );
    }
    const updatedStockCard = await this.prisma.imc_ProductStockCard.update({
      where: {
        product_id_floor_id_shelf_id_row_id_mExpired_dt_yExpired_dt_doc_id_mutation_id_srn_seq_warehouse_id_company_id:
          {
            product_id,
            floor_id: 'default_floor_id',
            shelf_id: 'default_shelf_id',
            row_id: 'default_row_id',
            mExpired_dt: 'default_mExpired_dt',
            yExpired_dt: 'default_yExpired_dt',
            doc_id,
            mutation_id: 'default_mutation_id',
            srn_seq: 0,
            warehouse_id: 'default_warehouse_id',
            company_id: 'default_company_id',
          },
      },
      data: updateDto,
    });
    return this.mapToResponseDto(updatedStockCard);
  }

  private mapToResponseDto(stockCard: any): Imc_ResponseProductStockCardDto {
    return {
      customer_or_supplier_id: stockCard.customer_or_supplier_id,
      trx_id: stockCard.trx_id,
      trx_class: stockCard.trx_class,
      module_id: stockCard.module_id,
      is_in_or_out: stockCard.is_in_or_out,
      doc_year: stockCard.doc_year,
      doc_month: stockCard.doc_month,
      doc_date: stockCard.doc_date,
      doc_id: stockCard.doc_id,
      descs: stockCard.descs,
      mutation_id: stockCard.mutation_id,
      mutation_date: stockCard.mutation_date,
      ref_id: stockCard.ref_id,
      ref_date: stockCard.ref_date,
      iStatus: stockCard.iStatus,
      warehouse_id: stockCard.warehouse_id,
      to_warehouse_id: stockCard.to_warehouse_id,
      srn_seq: stockCard.srn_seq,
      product_id: stockCard.product_id,
      qty: stockCard.qty,
      mutation_qty: stockCard.mutation_qty,
      unit_cost: stockCard.unit_cost,
      mutation_cost: stockCard.mutation_cost,
      floor_id: stockCard.floor_id,
      shelf_id: stockCard.shelf_id,
      row_id: stockCard.row_id,
      batch_no: stockCard.batch_no,
      mExpired_dt: stockCard.mExpired_dt,
      yExpired_dt: stockCard.yExpired_dt,
      product_cd: stockCard.product_cd,
      i_month_expired: stockCard.i_month_expired,
      i_year_expired: stockCard.i_year_expired,
      selling_price: stockCard.selling_price,
      createdBy: stockCard.createdBy,
      createdAt: stockCard.createdAt,
      updatedBy: stockCard.updatedBy,
      updatedAt: stockCard.updatedAt,
      company_id: stockCard.company_id,
      branch_id: stockCard.branch_id,
    };
  }
}
