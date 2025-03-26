import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Imc_CreateProductStockCardDto } from './dto/imc_CreateProductStockCard.dto';
import { Imc_UpdateProductStockCard } from './dto/imc_UpdateProductStockCard.dto';

@Injectable()
export class imc_ProductStockCardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: Imc_CreateProductStockCardDto): Promise<any> {
    return this.prisma.imc_ProductStockCard.create({
      data: {
        ...createDto,
        updatedAt: createDto.updatedAt ?? new Date().toISOString(),
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.imc_ProductStockCard.findMany();
  }

  async findOne(product_id: string, doc_id: string): Promise<any> {
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
    return stockCard;
  }
}
