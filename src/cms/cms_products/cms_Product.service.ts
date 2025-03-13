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
    return {
      ...product,
      iShowedStatus: product.iShowedStatus === 'HIDDEN' ? 'HIDDEN' : 'SHOW',
    } as Cms_ResponseProductDto;
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
        register_id: product.register_id?.trim() || undefined,
        category_id: product.category_id.trim(),
        subCategory_id: product.subCategory_id.trim(),
        brand_id: product.brand_id.trim(),
        uom_id: product.uom_id?.trim(),
        primaryImageURL,
      };
    });

    return productsWithPrimaryImage as Cms_ResponseProductDto[];
  }

  async findBySlug(
    company_id: string,
    slug: string,
  ): Promise<Cms_ResponseProductDto[]> {
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

    const primaryImages = product.images.filter((image) => image.isPrimary);
    const primaryImageURL =
      primaryImages.length > 0 ? primaryImages[0].imageURL : null;

    const responseProduct: Cms_ResponseProductDto = {
      ...product,
      id: product.id.trim(),
      register_id: product.register_id?.trim() || undefined,

      name: product.name.trim(),
      slug: product.slug?.trim(),
      catalog_id: product.catalog_id?.trim(),
      primaryImageURL,
    };
    return [responseProduct]; // Mengembalikan hasil sebagai array
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
      } as Cms_ResponseProductDto;
    });
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
    const cms_UpdatedProduct = await this.prisma.imc_Product.update({
      where: { company_id_id: { id, company_id } },
      data: cms_UpdateProductDto,
    });
    return cms_UpdatedProduct as Cms_ResponseProductDto;
  }
}
