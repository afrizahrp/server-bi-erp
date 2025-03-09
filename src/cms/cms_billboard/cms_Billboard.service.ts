import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Cms_CreateBillboardDto } from './dto/cms_CreateBillboard.dto';
import { Cms_UpdateBillboardDto } from './dto/cms_UpdateBillboard.dto';
import { Cms_ResponseBillboardDto } from './dto/cms_ResponseBillboard.dto';

@Injectable()
export class cms_BillboardService {
  constructor(private prisma: PrismaService) {}

  async create(
    cms_CreateBillboardDto: Cms_CreateBillboardDto,
  ): Promise<Cms_ResponseBillboardDto> {
    const billboard = await this.prisma.cms_Billboard.create({
      data: cms_CreateBillboardDto,
    });
    return billboard as Cms_ResponseBillboardDto;
  }

  async findAll(company_id: string): Promise<Cms_ResponseBillboardDto[]> {
    const billboards = await this.prisma.cms_Billboard.findMany({
      where: { company_id, iShowedStatus: 'SHOW' },
    });
    return billboards as Cms_ResponseBillboardDto[];
  }

  async findOne(
    company_id: string,
    id: number,
  ): Promise<Cms_ResponseBillboardDto> {
    const billboard = await this.prisma.cms_Billboard.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!billboard) {
      throw new NotFoundException(`Billboard with ID ${id} not found`);
    }
    return billboard as Cms_ResponseBillboardDto;
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
    return updatedBillboard as Cms_ResponseBillboardDto;
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
}
