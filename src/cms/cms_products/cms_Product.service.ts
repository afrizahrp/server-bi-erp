import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Cms_CreateProductDto } from './dto/cms_CreateProduct.dto';
import { Cms_UpdateProductDto } from './dto/cms_UpdateProducts.dto';
import { Cms_ResponseProductDto } from './dto/cms_ResponseProducts.dto';

@Injectable()
export class cms_ProductService {
  constructor(private prisma: PrismaService) {}

  async create(
    cms_CreateProductDto: Cms_CreateProductDto,
  ): Promise<Cms_ResponseProductDto> {
    const product = await this.prisma.imc_Product.create({
      data: cms_CreateProductDto,
    });
    return mapProductToResponse(product);
  }

  async findAll(
    company_id: string,
    category_id: string,
  ): Promise<Cms_ResponseProductDto[]> {
    const products = await this.prisma.imc_Product.findMany({
      where: { company_id, category_id, iShowedStatus: 'SHOW' },
      include: {
        category: {
          select: { name: true },
        },
        images: {
          select: { imageURL: true, isPrimary: true },
        },
        descriptions: {
          select: { descriptions: true, benefits: true },
        },
      },
    });

    return products.map(mapProductToResponse);
  }

  async findBySlug(
    company_id: string,
    slug: string,
  ): Promise<Cms_ResponseProductDto> {
    const product = await this.prisma.imc_Product.findFirst({
      where: { company_id, slug },
      include: {
        category: {
          select: { name: true },
        },
        images: {
          select: { imageURL: true, isPrimary: true },
        },
        descriptions: {
          select: { descriptions: true, benefits: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return mapProductToResponse(product);
  }

  async findByName(
    company_id: string,
    name: string,
  ): Promise<Cms_ResponseProductDto[]> {
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
          select: { descriptions: true, benefits: true },
        },
      },
    });

    if (products.length === 0) {
      throw new NotFoundException(`Products with name ${name} not found`);
    }

    return products.map(mapProductToResponse);
  }

  async update(
    id: string,
    company_id: string,
    cms_UpdateProductDto: Cms_UpdateProductDto,
  ): Promise<Cms_ResponseProductDto> {
    const product = await this.prisma.imc_Product.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const updatedProduct = await this.prisma.imc_Product.update({
      where: { company_id_id: { id, company_id } },
      data: cms_UpdateProductDto,
    });
    return mapProductToResponse(updatedProduct);
  }
}

export function mapProductToResponse(product: any): Cms_ResponseProductDto {
  const primaryImages = product.images.filter((image) => image.isPrimary);
  const primaryImageURL =
    primaryImages.length > 0 ? primaryImages[0].imageURL : null;

  return {
    id: product.id.trim(),
    catalog_id: product.catalog_id?.trim(),
    name: product.name.trim(),
    slug: product.slug?.trim(),
    eCatalogURL: product.eCatalogURL,
    category_id: product.category_id.trim(),
    updatedAt: product.updatedAt,
    category: {
      name: product.category.name.trim(),
    },
    images: product.images.map((image) => ({
      imageURL: image.imageURL,
      isPrimary: image.isPrimary,
    })),
    descriptions: {
      descriptions: product.descriptions.descriptions,
      benefits: product.descriptions.benefits,
    },
    primaryImageURL,
  };
}
