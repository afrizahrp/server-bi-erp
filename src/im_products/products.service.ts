import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { ResponseProductDto } from './dto/responseProduct.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ResponseProductDto> {
    const product = await this.prisma.im_Products.create({
      data: createProductDto,
    });
    return product as ResponseProductDto;
  }

  async findAll(
    company_id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ResponseProductDto[]> {
    const skip = (page - 1) * limit;
    const products = await this.prisma.im_Products.findMany({
      where: { company_id },
      skip,
      take: limit,
      include: {
        category: {
          select: { name: true },
        },
      },
    });
    return products as ResponseProductDto[];
  }

  async findOne(company_id: string, id: string): Promise<ResponseProductDto> {
    const product = await this.prisma.im_Products.findUnique({
      where: { company_id_id: { company_id, id } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product as ResponseProductDto;
  }

  async update(
    id: string,
    company_id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ResponseProductDto> {
    const product = await this.prisma.im_Products.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const updatedProduct = await this.prisma.im_Products.update({
      where: { company_id_id: { id, company_id } },
      data: updateProductDto,
    });
    return updatedProduct as ResponseProductDto;
  }
}
