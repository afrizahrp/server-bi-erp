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
    return {
      ...product,
      iShowedStatus: product.iShowedStatus === 'HIDDEN' ? 'HIDDEN' : 'VISIBLE',
    } as ResponseProductDto;
  }

  // async findBySlug(company_id: string, slug: string): Promise<any> {

  async findAll(company_id: string, category_id: string): Promise<any[]> {
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
        primaryImageURL,
      };
    });

    return productsWithPrimaryImage;

    // return products as ResponseProductDto[];
  }

  async findOne(company_id: string, id: string): Promise<any> {
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
      primaryImageURL,
    };
  }

  async findBySlug(company_id: string, slug: string): Promise<any> {
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
      primaryImageURL,
    };
  }

  async findByName(company_id: string, name: string): Promise<any> {
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
      primaryImageURL,
    };
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
