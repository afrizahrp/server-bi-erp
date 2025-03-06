import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ResponseCategoryDto } from './dto/responseCategory.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(company_id: string): Promise<{ data: any[] }> {
    // Ambil data dengan paginasi dan pilih kolom yang diinginkan
    const categories = await this.prisma.im_Categories.findMany({
      where: { company_id, iShowedStatus: 'SHOW' },
    });

    // Map hasil untuk menyesuaikan format ResponseCategoryDto
    const formattedCategories = categories.map((category) => ({
      id: category.id.trim(),
      name: category.name?.trim(),
      imageURL: category.imageURL?.trim(),
    }));

    return { data: formattedCategories };
  }

  async findOne(company_id: string, id: string): Promise<ResponseCategoryDto> {
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
    } as ResponseCategoryDto;
  }
}
