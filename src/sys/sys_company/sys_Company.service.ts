import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Sys_CreateCompanyDto } from './dto/sys_CreateCompany.dto';
import { Sys_UpdateCompanyDto } from './dto/sys_UpdateCompany.dto';
import { Sys_ResponseCompanyDto } from './dto/sys_ResponseCompany.dto';

@Injectable()
export class Sys_CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCompanyDto: Sys_CreateCompanyDto,
  ): Promise<Sys_ResponseCompanyDto> {
    const company = await this.prisma.sys_Company.create({
      data: createCompanyDto,
    });
    return company as Sys_ResponseCompanyDto;
  }

  async findAll(): Promise<Sys_ResponseCompanyDto[]> {
    const companies = await this.prisma.sys_Company.findMany();
    return companies as Sys_ResponseCompanyDto[];
  }

  async findOne(id: string): Promise<Sys_ResponseCompanyDto> {
    const company = await this.prisma.sys_Company.findUnique({
      where: { id },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company as Sys_ResponseCompanyDto;
  }

  async update(
    id: string,
    updateCompanyDto: Sys_UpdateCompanyDto,
  ): Promise<Sys_ResponseCompanyDto> {
    const company = await this.prisma.sys_Company.findUnique({
      where: { id },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    const updatedCompany = await this.prisma.sys_Company.update({
      where: { id },
      data: updateCompanyDto,
    });
    return updatedCompany as Sys_ResponseCompanyDto;
  }

  async remove(id: string): Promise<void> {
    const company = await this.prisma.sys_Company.findUnique({
      where: { id },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    await this.prisma.sys_Company.delete({
      where: { id },
    });
  }
}
