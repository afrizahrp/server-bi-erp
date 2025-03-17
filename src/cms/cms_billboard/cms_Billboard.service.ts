import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Cms_CreateBillboardDto } from './dto/cms_CreateBillboard.dto';
import { Cms_UpdateBillboardDto } from './dto/cms_UpdateBillboard.dto';
import { Cms_ResponseBillboardDto } from './dto/cms_ResponseBillboard.dto';
import { Cms_PaginationBillboardDto } from './dto/cms_PaginationBillboard.dto';

@Injectable()
export class cms_BillboardService {
  constructor(private prisma: PrismaService) {}

  async create(
    cms_CreateBillboardDto: Cms_CreateBillboardDto,
  ): Promise<Cms_ResponseBillboardDto> {
    const billboard = await this.prisma.cms_Billboard.create({
      data: cms_CreateBillboardDto,
    });
    return this.mapToResponseDto(billboard);
  }

  async findAll(
    company_id: string,
    module_id: string,
    paginationDto: Cms_PaginationBillboardDto,
  ): Promise<{ data: Cms_ResponseBillboardDto[]; totalRecords: number }> {
    const { page = 1, limit = 10 } = paginationDto;

    const whereCondition = { company_id, module_id };
    const totalRecords = await this.prisma.cms_Billboard.count({
      where: whereCondition,
    });

    // Pastikan skip tidak lebih besar dari totalRecords
    const skip = Math.min((page - 1) * limit, totalRecords);

    const billboards = await this.prisma.cms_Billboard.findMany({
      where: whereCondition,
      skip,
      take: limit,
    });

    const formattedBillboards = billboards.map(this.mapToResponseDto);
    return { data: formattedBillboards, totalRecords };
  }

  async getShowedBillboard(
    company_id: string,
  ): Promise<Cms_ResponseBillboardDto[]> {
    const billboards = await this.prisma.cms_Billboard.findMany({
      where: { company_id, iShowedStatus: 'SHOW' },
    });

    return billboards.map(this.mapToResponseDto);
  }

  async findOne(
    company_id: string,
    id: string,
  ): Promise<Cms_ResponseBillboardDto> {
    const billboard = await this.prisma.cms_Billboard.findUnique({
      where: {
        company_id_id: {
          company_id: company_id,
          id: parseInt(id, 10), // Ensure id is passed as an Int
        },
      },
    });
    if (!billboard) {
      throw new NotFoundException(`Billboard with ID ${id} not found`);
    }
    return this.mapToResponseDto(billboard);
  }

  async update(
    id: number,
    company_id: string,
    cms_UpdateBillboardDto: Cms_UpdateBillboardDto,
  ): Promise<Cms_ResponseBillboardDto> {
    const billboard = await this.prisma.cms_Billboard.findUnique({
      where: {
        company_id_id: { id, company_id: cms_UpdateBillboardDto.company_id! },
      },
    });
    if (!billboard) {
      throw new NotFoundException(`Billboard with ID ${id} not found`);
    }
    const updatedBillboard = await this.prisma.cms_Billboard.update({
      where: {
        company_id_id: { id, company_id: cms_UpdateBillboardDto.company_id! },
      },
      data: cms_UpdateBillboardDto,
    });
    return this.mapToResponseDto(updatedBillboard);
  }

  async remove(company_id: string, id: number): Promise<void> {
    const billboard = await this.prisma.cms_Billboard.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!billboard) {
      throw new NotFoundException(`Billboard with ID ${id} not found`);
    }
    await this.prisma.cms_Billboard.delete({
      where: { company_id_id: { id, company_id } },
    });
  }

  private mapToResponseDto(billboard: any): Cms_ResponseBillboardDto {
    return {
      id: billboard.id,
      section: billboard.section,
      content_id: billboard.content_id.trim() || 0,
      title: billboard.title.trim() || '',
      name: billboard.name.trim() || '',
      isImage: billboard.isImage || true,
      contentURL: billboard.contentURL || '',
      contentType: billboard.contentType,
      iStatus: billboard.iStatus || 'ACTIVE',
      iShowedStatus: billboard.iShowedStatus || 'SHOW',
      remarks: billboard.remarks || '',
    };
  }
}
