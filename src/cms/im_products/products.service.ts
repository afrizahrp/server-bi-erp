import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { ResponseCmsProductDto } from './dto/responseCmsProduct.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ResponseCmsProductDto> {
    const product = await this.prisma.im_Products.create({
      data: createProductDto,
    });
    return {
      ...product,
      iShowedStatus: product.iShowedStatus === 'HIDDEN' ? 'HIDDEN' : 'SHOW',
    } as ResponseCmsProductDto;
  }

  async findAll(
    company_id: string,
    category_id: string,
  ): Promise<ResponseCmsProductDto[]> {
    const products = await this.prisma.im_Products.findMany({
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
        register_id: product.register_id?.trim(),
        category_id: product.category_id.trim(),
        subCategory_id: product.subCategory_id.trim(),
        brand_id: product.brand_id.trim(),
        uom_id: product.uom_id?.trim(),
        primaryImageURL,
      };
    });

    return productsWithPrimaryImage as ResponseCmsProductDto[];
  }

  async findOne(
    company_id: string,
    id: string,
  ): Promise<ResponseCmsProductDto> {
    const product = await this.prisma.im_Products.findUnique({
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
    } as ResponseCmsProductDto;
  }

  async findBySlug(
    company_id: string,
    slug: string,
  ): Promise<ResponseCmsProductDto> {
    const product = await this.prisma.im_Products.findFirst({
      where: { company_id, slug },
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
      throw new NotFoundException(`Product with slug ${slug} not found`);
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
    } as ResponseCmsProductDto;
  }

  async findByName(
    company_id: string,
    name: string,
  ): Promise<ResponseCmsProductDto> {
    const product = await this.prisma.im_Products.findFirst({
      where: {
        company_id,
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

    if (!product) {
      throw new NotFoundException(`Product with name ${name} not found`);
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
    } as ResponseCmsProductDto;
  }

  async update(
    id: string,
    company_id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ResponseCmsProductDto> {
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
    return updatedProduct as ResponseCmsProductDto;
  }
}
