import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { ResponseCategorytDto } from './dto/responseCategory.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseCategorytDto> {
    const category = await this.prisma.im_Categories.create({
      data: createCategoryDto,
    });
    return {
      id: category.id,
      name: category.name,
      // categoryType: category.categoryType?.name,
      // status: category.status?.name,
      remarks: category.remarks,
    } as ResponseCategorytDto;
  }

  async findAll(
    company_id: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<{ data: ResponseCategorytDto[]; total: number }> {
    // Validasi parameter pagination
    if (page < 1) {
      page = 1;
    }
    if (limit < 1) {
      limit = 10;
    }

    const skip = (page - 1) * limit;

    // Hitung jumlah total data
    const total = await this.prisma.im_Categories.count({
      where: { company_id },
    });

    // Ambil data dengan paginasi dan pilih kolom yang diinginkan
    const categories = await this.prisma.im_Categories.findMany({
      where: { company_id },
      skip,
      take: limit,
      include: {
        categoryType: true,
      },
    });

    // Map hasil untuk menyesuaikan format ResponseCategorytDto
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      categoryType: category.categoryType?.name,
      status: category.iStatus,
      remarks: category.remarks,
    }));

    return { data: formattedCategories as ResponseCategorytDto[], total };
  }

  async findOne(company_id: string, id: string): Promise<ResponseCategorytDto> {
    const category = await this.prisma.im_Categories.findUnique({
      where: { company_id_id: { company_id, id } },
      include: {
        categoryType: true,
      },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return {
      id: category.id,
      name: category.name,
      categoryType: category.categoryType?.name,
      iStatus: category.iStatus,
      remarks: category.remarks,
    } as ResponseCategorytDto;
  }

  async update(
    id: string,
    company_id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponseCategorytDto> {
    const category = await this.prisma.im_Categories.findUnique({
      where: { company_id_id: { id, company_id } },
      include: {
        categoryType: true,
      },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    const updatedCategory = await this.prisma.im_Categories.update({
      where: { company_id_id: { id, company_id } },
      data: updateCategoryDto,
      include: {
        categoryType: true,
      },
    });
    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      categoryType: updatedCategory.categoryType?.name,
      iStatus: updatedCategory.iStatus,
      remarks: updatedCategory.remarks,
    } as ResponseCategorytDto;
  }
}
