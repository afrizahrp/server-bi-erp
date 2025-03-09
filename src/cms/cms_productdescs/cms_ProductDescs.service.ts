import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Cms_CreateProductDescsDto } from './dto/cms_CreateProductDescs.dto';
import { Cms_UpdateProductDescsDto } from './dto/cms_UpdateProductDescs.dto';
import { Cms_ResponseProductDescsDto } from './dto/cms_ResponseProductDescs.dto';

@Injectable()
export class cms_ProductDescsService {
  constructor(private prisma: PrismaService) {}

  async create(
    cms_CreateProductDescsDto: Cms_CreateProductDescsDto,
  ): Promise<Cms_ResponseProductDescsDto> {
    const productDesc = await this.prisma.imc_ProductDescs.create({
      data: cms_CreateProductDescsDto,
    });
    return productDesc as Cms_ResponseProductDescsDto;
  }

  async findAll(company_id: string): Promise<Cms_ResponseProductDescsDto[]> {
    const products = await this.prisma.imc_ProductDescs.findMany({
      where: { company_id },
    });
    return products as Cms_ResponseProductDescsDto[];
  }

  async findOne(
    company_id: string,
    id: string,
  ): Promise<Cms_ResponseProductDescsDto> {
    const product = await this.prisma.imc_ProductDescs.findUnique({
      where: { id_company_id: { company_id, id } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product as Cms_ResponseProductDescsDto;
  }

  async update(
    id: string,
    company_id: string,
    cms_UpdateProductDescsDto: Cms_UpdateProductDescsDto,
  ): Promise<Cms_ResponseProductDescsDto> {
    const productDesc = await this.prisma.imc_ProductDescs.findUnique({
      where: { id_company_id: { id, company_id } },
    });
    if (!productDesc) {
      throw new NotFoundException(
        `Product description with ID ${id} not found`,
      );
    }
    const updatedProductDesc = await this.prisma.imc_ProductDescs.update({
      where: { id_company_id: { id, company_id } },
      data: cms_UpdateProductDescsDto,
    });
    return updatedProductDesc as Cms_ResponseProductDescsDto;
  }
}
