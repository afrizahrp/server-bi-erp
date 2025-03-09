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

  async findAll(
    orderBy: string = 'seq_no',
    order: 'asc' | 'desc' = 'asc',
  ): Promise<Sys_ResponseCompanyDto[]> {
    const companies = await this.prisma.sys_Company.findMany({
      orderBy: {
        [orderBy]: order,
      },
    });
    return companies.map(this.mapToResponseDto);
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

  private mapToResponseDto(company: any): Sys_ResponseCompanyDto {
    return {
      ...company,
      seq_no: company.seqNo,
      id: company.id.trim(),
      name: company.name?.trim(),
      province: company.province?.trim(),
      district: company.district?.trim(),
      city: company.city?.trim(),
      address1: company.address1?.trim(),
      address2: company.address2?.trim(),
      address3: company.address3?.trim(),
      postalCode: company.postalCode?.trim(),
      phone1: company.phone1?.trim(),
      phone2: company.phone2?.trim(),
      phone3: company.phone3?.trim(),
      mobile1: company.mobile1?.trim(),
      mobile2: company.mobile2?.trim(),
      mobile3: company.mobile3?.trim(),
      email1: company.email1?.trim(),
      email2: company.email2?.trim(),
      email3: company.email3?.trim(),
      officialWebsite: company.officialWebsite?.trim(),
      createdBy: company.createdBy?.trim(),
      updatedBy: company.updatedBy?.trim(),
      image: company.image?.trim(),
    };
  }
}
