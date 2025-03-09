import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Imc_CreateProductDto } from './dto/imc_CreateProduct.dto';
import { Imc_UpdateProductDto } from './dto/imc_UpdateProducts.dto';
import { Imc_ResponseProductDto } from './dto/imc_ResponseProducts.dto';
import { Imc_PaginationProductDto } from './dto/imc_PaginationProduct.dto';

@Injectable()
export class imc_ProductService {
  constructor(private prisma: PrismaService) {}

  async create(
    imc_CreateProductDto: Imc_CreateProductDto,
  ): Promise<Imc_ResponseProductDto> {
    const product = await this.prisma.imc_Product.create({
      data: imc_CreateProductDto,
    });
    return {
      ...product,
      iShowedStatus: product.iShowedStatus === 'HIDDEN' ? 'HIDDEN' : 'SHOW',
    } as Imc_ResponseProductDto;
  }

  async findAll(
    company_id: string,
    paginationDto: Imc_PaginationProductDto,
  ): Promise<Imc_ResponseProductDto[]> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const products = await this.prisma.imc_Product.findMany({
      where: { company_id, iShowedStatus: 'SHOW' },
      skip,
      take: limit,
      include: {
        category: {
          select: { name: true },
        },
        images: {
          select: { imageURL: true, isPrimary: true },
        },
        descriptions: {
          select: { descriptions: true },
        },
      },
    });

    const productsWithPrimaryImage = products.map((product) => {
      const primaryImages = product.images.filter((image) => image.isPrimary);
      const primaryImageURL =
        primaryImages.length > 0 ? primaryImages[0].imageURL : null;
      return {
        ...product,
        id: product.id.trim(),
        name: product.name.trim(),
        slug: product.slug?.trim(),
        catalog_id: product.catalog_id?.trim(),
        register_id: product.register_id?.trim(),
        category_id: product.category_id.trim(),
        subCategory_id: product.subCategory_id.trim(),
        brand_id: product.brand_id.trim(),
        uom_id: product.uom_id?.trim(),
        primaryImageURL,
      };
    });

    return productsWithPrimaryImage as Imc_ResponseProductDto[];
  }

  async findOne(
    company_id: string,
    id: string,
  ): Promise<Imc_ResponseProductDto> {
    const product = await this.prisma.imc_Product.findUnique({
      where: { company_id_id: { company_id, id } },
      include: {
        category: {
          select: { name: true },
        },
        images: {
          select: { imageURL: true, isPrimary: true },
        },
        descriptions: {
          select: { descriptions: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const primaryImages = product.images.filter((image) => image.isPrimary);
    const primaryImageURL =
      primaryImages.length > 0 ? primaryImages[0].imageURL : null;

    return {
      ...product,
      id: product.id.trim(),
      name: product.name.trim(),
      slug: product.slug?.trim(),
      catalog_id: product.catalog_id?.trim(),
      register_id: product.register_id?.trim(),
      category_id: product.category_id.trim(),
      subCategory_id: product.subCategory_id.trim(),
      brand_id: product.brand_id.trim(),
      uom_id: product.uom_id?.trim(),
      primaryImageURL,
    } as Imc_ResponseProductDto;
  }

  async findByName(
    company_id: string,
    name: string,
  ): Promise<Imc_ResponseProductDto[]> {
    const products = await this.prisma.imc_Product.findMany({
      where: {
        company_id,
        iShowedStatus: 'SHOW',
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      include: {
        category: {
          select: { name: true },
        },
        images: {
          select: { imageURL: true, isPrimary: true },
        },
        descriptions: {
          select: { descriptions: true },
        },
      },
    });

    if (products.length === 0) {
      throw new NotFoundException(`Products with name ${name} not found`);
    }

    return products.map((product) => {
      const primaryImages = product.images.filter((image) => image.isPrimary);
      const primaryImageURL =
        primaryImages.length > 0 ? primaryImages[0].imageURL : null;

      return {
        ...product,
        id: product.id.trim(),
        name: product.name.trim(),
        slug: product.slug?.trim(),
        catalog_id: product.catalog_id?.trim(),
        register_id: product.register_id?.trim(),
        category_id: product.category_id.trim(),
        subCategory_id: product.subCategory_id.trim(),
        brand_id: product.brand_id.trim(),
        uom_id: product.uom_id?.trim(),
        primaryImageURL,
      } as Imc_ResponseProductDto;
    });
  }

  async update(
    id: string,
    company_id: string,
    imc_UpdateProductDto: Imc_UpdateProductDto,
  ): Promise<Imc_ResponseProductDto> {
    const product = await this.prisma.imc_Product.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const updatedProduct = await this.prisma.imc_Product.update({
      where: { company_id_id: { id, company_id } },
      data: imc_UpdateProductDto,
    });
    return updatedProduct as Imc_ResponseProductDto;
  }
}
