import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { ResponseCmsCategoryDto } from './dto/responseCmsCategory.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseCmsCategoryDto> {
    const category = await this.prisma.im_Categories.create({
      data: createCategoryDto,
    });
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageURL: category.imageURL?.trim(),
    } as ResponseCmsCategoryDto;
  }

  async findAll(
    company_id: string,
  ): Promise<{ data: ResponseCmsCategoryDto[] }> {
    const categories = await this.prisma.im_Categories.findMany({
      where: { company_id, iShowedStatus: 'SHOW' },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id.trim(),
      name: category.name?.trim(),
      slug: category.slug?.trim(),
      imageURL: category.imageURL?.trim(),
    }));

    return { data: formattedCategories as ResponseCmsCategoryDto[] };
  }

  async findBySlug(
    company_id: string,
    slug: string,
  ): Promise<ResponseCmsCategoryDto> {
    const category = await this.prisma.im_Categories.findFirst({
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
    } as ResponseCmsCategoryDto;
  }

  async update(
    id: string,
    company_id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponseCmsCategoryDto> {
    const category = await this.prisma.im_Categories.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    const updatedCategory = await this.prisma.im_Categories.update({
      where: { company_id_id: { id, company_id } },
      data: updateCategoryDto,
    });
    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
    } as ResponseCmsCategoryDto;
  }
}
