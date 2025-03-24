import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Imc_CreateCategoryTypeDto } from './dto/imc_CreateCategoryType.dto';
import { Imc_UpdateCategoryTypeDto } from './dto/imc_UpdateCategoryType.dto';
import { Imc_ResponseCategoryTypeDto } from './dto/imc_ResponseCategoryType.dto';
import { Imc_PaginationCategoryTypeDto } from './dto/imc_PaginationCategoryType.dto';

@Injectable()
export class imc_CategoryTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    imc_CreateCategoryTypeDto: Imc_CreateCategoryTypeDto,
  ): Promise<Imc_ResponseCategoryTypeDto> {
    const categoryType = await this.prisma.imc_CategoryType.create({
      data: imc_CreateCategoryTypeDto,
    });
    return this.mapToResponseDto(categoryType);
  }

  async findAll(
    company_id: string,
    module_id: string,
    paginationDto: Imc_PaginationCategoryTypeDto,
  ): Promise<{ data: Imc_ResponseCategoryTypeDto[]; totalRecords: number }> {
    const { page = 1, limit = 20 } = paginationDto;

    let totalRecords: number;
    let categoryTypes: any[];

    const whereCondition = { company_id };
    totalRecords = await this.prisma.imc_CategoryType.count({
      where: whereCondition,
    });
    const skip = Math.min((page - 1) * limit, totalRecords);

    categoryTypes = await this.prisma.imc_CategoryType.findMany({
      where: whereCondition,
      skip,
      take: limit,
    });

    const formattedCategoryTypes = categoryTypes.map(this.mapToResponseDto);

    return { data: formattedCategoryTypes, totalRecords };
  }

  async findOne(id: number): Promise<Imc_ResponseCategoryTypeDto> {
    const categoryType = await this.prisma.imc_CategoryType.findUnique({
      where: { id },
    });
    if (!categoryType) {
      throw new NotFoundException(`CategoryType with ID ${id} not found`);
    }
    return this.mapToResponseDto(categoryType);
  }

  async update(
    id: number,
    imc_UpdateCategoryTypeDto: Imc_UpdateCategoryTypeDto,
  ): Promise<Imc_ResponseCategoryTypeDto> {
    const categoryType = await this.prisma.imc_CategoryType.findUnique({
      where: { id },
    });
    if (!categoryType) {
      throw new NotFoundException(`CategoryType with ID ${id} not found`);
    }
    const updatedCategoryType = await this.prisma.imc_CategoryType.update({
      where: { id },
      data: imc_UpdateCategoryTypeDto,
    });
    return this.mapToResponseDto(updatedCategoryType);
  }

  async remove(id: number): Promise<void> {
    const categoryType = await this.prisma.imc_CategoryType.findUnique({
      where: { id },
    });
    if (!categoryType) {
      throw new NotFoundException(`CategoryType with ID ${id} not found`);
    }
    await this.prisma.imc_CategoryType.delete({
      where: { id },
    });
  }

  private mapToResponseDto(categoryType: any): Imc_ResponseCategoryTypeDto {
    return {
      id: categoryType.id,
      name: categoryType.name,
      iStatus: categoryType.iStatus,
      remarks: categoryType.remarks,
      stock_acct: categoryType.stock_acct,
      sales_acct: categoryType.sales_acct,
      cogs_acct: categoryType.cogs_acct,
      expense_acct: categoryType.expense_acct,
      asset_acct: categoryType.asset_acct,
      createdBy: categoryType.createdBy,
      createdAt: categoryType.createdAt,
      updatedBy: categoryType.updatedBy,
      updatedAt: categoryType.updatedAt,
      company_id: categoryType.company_id,
      branch_id: categoryType.branch_id,
    };
  }
}
