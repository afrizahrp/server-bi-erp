import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Cms_CreateProductDescDto } from './dto/cms_CreateProductDesc.dto';
import { Cms_UpdateProductDescDto } from './dto/cms_UpdateProductDesc.dto';
import { Cms_ResponseProductDescDto } from './dto/cms_ResponseProductDesc.dto';

@Injectable()
export class cms_ProductDescService {
  constructor(private prisma: PrismaService) {}

  async create(
    cms_CreateProductDescDto: Cms_CreateProductDescDto,
  ): Promise<Cms_ResponseProductDescDto> {
    const productDesc = await this.prisma.imc_ProductDesc.create({
      data: cms_CreateProductDescDto,
    });
    return productDesc as Cms_ResponseProductDescDto;
  }

  async findAll(company_id: string): Promise<Cms_ResponseProductDescDto[]> {
    const products = await this.prisma.imc_ProductDesc.findMany({
      where: { company_id },
    });
    return products as Cms_ResponseProductDescDto[];
  }

  async findOne(
    company_id: string,
    id: string,
  ): Promise<Cms_ResponseProductDescDto> {
    const product = await this.prisma.imc_ProductDesc.findUnique({
      where: { id_company_id: { company_id, id } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product as Cms_ResponseProductDescDto;
  }

  async update(
    id: string,
    company_id: string,
    cms_UpdateProductDescDto: Cms_UpdateProductDescDto,
  ): Promise<Cms_ResponseProductDescDto> {
    const productDesc = await this.prisma.imc_ProductDesc.findUnique({
      where: { id_company_id: { id, company_id } },
    });
    if (!productDesc) {
      throw new NotFoundException(
        `Product description with ID ${id} not found`,
      );
    }
    const updatedProductDesc = await this.prisma.imc_ProductDesc.update({
      where: { id_company_id: { id, company_id } },
      data: cms_UpdateProductDescDto,
    });
    return updatedProductDesc as Cms_ResponseProductDescDto;
  }
}
