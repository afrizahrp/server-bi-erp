import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { ResponseProductDescsDto } from './dto/responseProductDescs.dto';

@Injectable()
export class ProductDescsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    company_id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ResponseProductDescsDto[]> {
    const skip = (page - 1) * limit;
    const products = await this.prisma.im_ProductDescs.findMany({
      where: { company_id },
    });
    return products as ResponseProductDescsDto[];
  }

  async findOne(
    company_id: string,
    id: string,
  ): Promise<ResponseProductDescsDto> {
    const product = await this.prisma.im_ProductDescs.findUnique({
      where: { id_company_id: { company_id, id } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product as ResponseProductDescsDto;
  }
}
