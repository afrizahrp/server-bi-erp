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

import { WebsiteDisplayStatus } from '@prisma/client';

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
    module_id: string,
    paginationDto: Imc_PaginationCategoryDto,
  ): Promise<{ data: Imc_ResponseCategoryDto[]; totalRecords: number }> {
    const { page = 1, limit = 100, status, categoryType } = paginationDto;

    let whereCondition: any = { company_id };

    if (module_id !== 'IMC') {
      whereCondition.iShowedStatus = WebsiteDisplayStatus.SHOW;
    }

    if (status) {
      whereCondition.iStatus = { in: status.split(',') }; // ✅ Ubah string menjadi array
    }

    if (categoryType) {
      whereCondition.categoryType = { name: { in: categoryType.split(',') } }; // ✅ Ubah string menjadi array
    }

    const totalRecords = await this.prisma.imc_Category.count({
      where: whereCondition,
    });

    const skip = Math.min((page - 1) * limit, totalRecords);

    const categories = await this.prisma.imc_Category.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        categoryType: true,
      },
    });

    const formattedCategories = categories.map(this.mapToResponseDto);

    return { data: formattedCategories, totalRecords };
  }

  async findAllStatuses(
    company_id: string,
    module_id: string,
    categoryType?: string,
  ) {
    const whereCondition: any = { company_id };

    // Jika categoryType diberikan, cari ID-nya terlebih dahulu
    if (categoryType) {
      const categoryTypeRecord = await this.prisma.imc_CategoryType.findFirst({
        where: { name: categoryType },
        select: { id: true },
      });

      if (!categoryTypeRecord) {
        throw new Error(`Category type '${categoryType}' not found`);
      }

      whereCondition.type = categoryTypeRecord.id; // Gunakan ID, bukan string
    }

    // Query status berdasarkan whereCondition
    const statuses = await this.prisma.imc_Category.groupBy({
      by: ['iStatus'],
      where: whereCondition,
      _count: { _all: true },
    });

    return statuses.map((s) => ({
      id: s.iStatus,
      name: s.iStatus,
      count: s._count._all.toString(), // Konversi count ke string
    }));
  }

  async findAllCategoryType(
    company_id: string,
    module_id: string,
    filters?: { categoryType?: string; status?: string },
  ) {
    // Buat kondisi where secara dinamis
    const whereCondition: any = { company_id };

    if (filters?.categoryType) {
      whereCondition.type = filters.categoryType;
    }
    if (filters?.status) {
      whereCondition.iStatus = filters.status;
    }

    const types = await this.prisma.imc_Category.groupBy({
      by: ['type'],
      where: whereCondition,
      _count: {
        _all: true,
      },
    });

    // Ambil data `name` dari tabel `imc_CategoryType`
    const categoryTypeIds = types.map((s) => s.type);
    const categoryTypes = await this.prisma.imc_CategoryType.findMany({
      where: { id: { in: categoryTypeIds } },
      select: { id: true, name: true },
    });

    const categoryTypeMap = new Map(
      categoryTypes.map((ct) => [ct.id, ct.name]),
    );

    return types.map((s) => ({
      id: categoryTypeMap.get(s.type) || 'Unknown',
      name: categoryTypeMap.get(s.type) || 'Unknown',
      count: s._count._all.toString(), // Ubah angka ke string agar sesuai respons frontend
    }));
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
      remarks: category.remarks,
      iShowedStatus: category.iShowedStatus,
    };
  }
}
