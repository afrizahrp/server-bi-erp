import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Imc_CreateCategoryDto } from './dto/imc_CreateCategory.dto';
import { Imc_UpdateCategoryDto } from './dto/imc_UpdateCategory.dto';
import { Imc_ResponseCategoryDto } from './dto/imc_ResponseCategory.dto';

@Injectable()
export class imc_CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    imc_CreateCategoryDto: Imc_CreateCategoryDto,
  ): Promise<Imc_ResponseCategoryDto> {
    const category = await this.prisma.imc_Categories.create({
      data: imc_CreateCategoryDto,
    });
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageURL: category.imageURL?.trim(),
    } as Imc_ResponseCategoryDto;
  }

  async findAll(
    company_id: string,
  ): Promise<{ data: Imc_ResponseCategoryDto[] }> {
    const categories = await this.prisma.imc_Categories.findMany({
      where: { company_id, iShowedStatus: 'SHOW' },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id.trim(),
      name: category.name?.trim(),
      slug: category.slug?.trim(),
      imageURL: category.imageURL?.trim(),
    }));

    return { data: formattedCategories as Imc_ResponseCategoryDto[] };
  }

  async findOne(
    company_id: string,
    id: string,
  ): Promise<Imc_ResponseCategoryDto> {
    const category = await this.prisma.imc_Categories.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return {
      id: category.id.trim(),
      name: category.name?.trim(),
      slug: category.slug?.trim(),
      imageURL: category.imageURL?.trim(),
    } as Imc_ResponseCategoryDto;
  }

  async update(
    id: string,
    company_id: string,
    imc_UpdateCategoryDto: Imc_UpdateCategoryDto,
  ): Promise<Imc_ResponseCategoryDto> {
    const category = await this.prisma.imc_Categories.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    const updatedCategory = await this.prisma.imc_Categories.update({
      where: { company_id_id: { id, company_id } },
      data: imc_UpdateCategoryDto,
    });
    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
    } as Imc_ResponseCategoryDto;
  }
}
