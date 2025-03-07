import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { ResponseCmsCategoryDto } from './dto/responseCmsCategory.dto';
import { PaginationDto } from './dto/pagination.dto';

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
    } as ResponseCmsCategoryDto;
  }

  async findAll(
    company_id: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: ResponseCmsCategoryDto[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;

    // Validasi parameter pagination
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    const skip = (page - 1) * limit;

    // Hitung jumlah total data
    const total = await this.prisma.im_Categories.count({
      where: { company_id, iShowedStatus: 'SHOW' },
    });

    // Ambil data dengan paginasi dan pilih kolom yang diinginkan
    const categories = await this.prisma.im_Categories.findMany({
      where: { company_id, iShowedStatus: 'SHOW' },
      skip,
      take: limit,
    });

    // Map hasil untuk menyesuaikan format ResponseCmsCategoryDto
    const formattedCategories = categories.map((category) => ({
      id: category.id.trim(),
      name: category.name?.trim(),
      slug: category.slug?.trim(),
    }));

    return { data: formattedCategories as ResponseCmsCategoryDto[], total };
  }

  async findOne(
    company_id: string,
    id: string,
  ): Promise<ResponseCmsCategoryDto> {
    const category = await this.prisma.im_Categories.findUnique({
      where: { company_id_id: { company_id, id } },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return {
      id: category.id.trim(),
      name: category.name?.trim(),
      slug: category.slug?.trim(),
    } as ResponseCmsCategoryDto;
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
