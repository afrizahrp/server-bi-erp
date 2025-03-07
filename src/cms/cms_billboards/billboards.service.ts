import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateBillboardDto } from './dto/createBillboard.dto';
import { UpdateBillboardDto } from './dto/updateBillboard.dto';
import { ResponseBillboardDto } from './dto/responseBillboard.dto';

@Injectable()
export class BillboardsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBillboardDto: CreateBillboardDto,
  ): Promise<ResponseBillboardDto> {
    const billboard = await this.prisma.cms_Billboards.create({
      data: createBillboardDto,
    });
    return billboard as ResponseBillboardDto;
  }

  async findAll(company_id: string): Promise<ResponseBillboardDto[]> {
    const billboards = await this.prisma.cms_Billboards.findMany({
      where: { company_id, iShowedStatus: 'SHOW' },
    });
    return billboards as ResponseBillboardDto[];
  }

  async findOne(company_id: string, id: number): Promise<ResponseBillboardDto> {
    const billboard = await this.prisma.cms_Billboards.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!billboard) {
      throw new NotFoundException(`Billboard with ID ${id} not found`);
    }
    return billboard as ResponseBillboardDto;
  }

  async update(
    id: number,
    company_id: string,
    updateBillboardDto: UpdateBillboardDto,
  ): Promise<ResponseBillboardDto> {
    const billboard = await this.prisma.cms_Billboards.findUnique({
      where: {
        company_id_id: { id, company_id: updateBillboardDto.company_id! },
      },
    });
    if (!billboard) {
      throw new NotFoundException(`Billboard with ID ${id} not found`);
    }
    const updatedBillboard = await this.prisma.cms_Billboards.update({
      where: {
        company_id_id: { id, company_id: updateBillboardDto.company_id! },
      },
      data: updateBillboardDto,
    });
    return updatedBillboard as ResponseBillboardDto;
  }

  async remove(company_id: string, id: number): Promise<void> {
    const billboard = await this.prisma.cms_Billboards.findUnique({
      where: { company_id_id: { id, company_id } },
    });
    if (!billboard) {
      throw new NotFoundException(`Billboard with ID ${id} not found`);
    }
    await this.prisma.cms_Billboards.delete({
      where: { company_id_id: { id, company_id } },
    });
  }
}
