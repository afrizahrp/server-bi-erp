import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Cms_CreateCategoryDto } from './dto/cms_CreateCategory.dto';
import { Cms_UpdateCategoryDto } from './dto/cms_UpdateCategory.dto';
import { Cms_ResponseCategoryDto } from './dto/cms_ResponseCategory.dto';

@Injectable()
export class cms_CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    cms_CreateCategoryDto: Cms_CreateCategoryDto,
  ): Promise<Cms_ResponseCategoryDto> {
    const category = await this.prisma.imc_Category.create({
      data: cms_CreateCategoryDto,
    });
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageURL: category.imageURL?.trim(),
    } as Cms_ResponseCategoryDto;
  }

  async findAll(
    company_id: string,
  ): Promise<{ data: Cms_ResponseCategoryDto[] }> {
    const categories = await this.prisma.imc_Category.findMany({
      where: { company_id, iShowedStatus: 'SHOW' },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id.trim(),
      name: category.name?.trim(),
      slug: category.slug?.trim(),
      imageURL: category.imageURL?.trim(),
    }));

    return { data: formattedCategories as Cms_ResponseCategoryDto[] };
  }

  async findBySlug(
    company_id: string,
    slug: string,
  ): Promise<Cms_ResponseCategoryDto> {
    const category = await this.prisma.imc_Category.findFirst({
      where: { company_id, slug },
    });
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    return {
      id: category.id.trim(),
      name: category.name?.trim(),
      slug: category.slug?.trim(),
      imageURL: category.imageURL?.trim(),
    } as Cms_ResponseCategoryDto;
  }

  async update(
    id: string,
    company_id: string,
    cms_UpdateCategoryDto: Cms_UpdateCategoryDto,
  ): Promise<Cms_ResponseCategoryDto> {
    const category = await this.prisma.imc_Category.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    const updatedCategory = await this.prisma.imc_Category.update({
      where: { company_id_id: { id, company_id } },
      data: cms_UpdateCategoryDto,
    });
    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
    } as Cms_ResponseCategoryDto;
  }
}
