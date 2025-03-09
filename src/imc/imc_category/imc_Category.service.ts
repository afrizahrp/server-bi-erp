import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Imc_CreateCategoryDto } from './dto/imc_CreateCategory.dto';
import { Imc_UpdateCategoryDto } from './dto/imc_UpdateCategory.dto';
import { Imc_ResponseCategoryDto } from './dto/imc_ResponseCategory.dto';
import { Imc_PaginationCategoryDto } from './dto/imc_PaginationCategory.dto';

@Injectable()
export class imc_CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(
    imc_CreateCategoryDto: Imc_CreateCategoryDto,
  ): Promise<Imc_ResponseCategoryDto> {
    const category = await this.prisma.imc_Category.create({
      data: imc_CreateCategoryDto,
    });
    return this.mapToResponseDto(category);
  }

  async findAll(
    company_id: string,
    paginationDto: Imc_PaginationCategoryDto,
  ): Promise<{ data: Imc_ResponseCategoryDto[]; totalRecords: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Query to get total records
    const totalRecords = await this.prisma.imc_Category.count({
      where: { company_id },
    });

    // Query to get paginated records
    const categories = await this.prisma.imc_Category.findMany({
      where: { company_id },
      skip,
      take: limit,
      include: {
        categoryType: {
          select: { name: true },
        },
      },
    });

    const formattedCategories = categories.map(this.mapToResponseDto);

    return { data: formattedCategories, totalRecords };
  }

  async findOne(
    company_id: string,
    id: string,
  ): Promise<Imc_ResponseCategoryDto> {
    const category = await this.prisma.imc_Category.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return this.mapToResponseDto(category);
  }

  async update(
    id: string,
    company_id: string,
    imc_UpdateCategoryDto: Imc_UpdateCategoryDto,
  ): Promise<Imc_ResponseCategoryDto> {
    const category = await this.prisma.imc_Category.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    const updatedCategory = await this.prisma.imc_Category.update({
      where: { company_id_id: { id, company_id } },
      data: imc_UpdateCategoryDto,
    });
    return this.mapToResponseDto(updatedCategory);
  }

  private mapToResponseDto(category: any): Imc_ResponseCategoryDto {
    return {
      id: category.id.trim(),
      name: category.name?.trim(),
      categoryType: category.categoryType?.name?.trim(),
      slug: category.slug?.trim(),
      iStatus: category.iStatus,
      imageURL: category.imageURL?.trim(),
      remarks: category.remarks?.trim(),
    };
  }
}
