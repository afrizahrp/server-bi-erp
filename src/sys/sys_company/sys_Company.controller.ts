import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { Sys_CompanyService } from './sys_Company.service';
import { Sys_CreateCompanyDto } from './dto/sys_CreateCompany.dto';
import { Sys_UpdateCompanyDto } from './dto/sys_UpdateCompany.dto';
import { Sys_ResponseCompanyDto } from './dto/sys_ResponseCompany.dto';

@Controller('sys/companies')
export class sys_CompanyController {
  constructor(private readonly companyService: Sys_CompanyService) {}

  @Post()
  async create(
    @Body() createCompanyDto: Sys_CreateCompanyDto,
  ): Promise<Sys_ResponseCompanyDto> {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  async findAll(): Promise<Sys_ResponseCompanyDto[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Sys_ResponseCompanyDto> {
    return this.companyService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: Sys_UpdateCompanyDto,
  ): Promise<Sys_ResponseCompanyDto> {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.companyService.remove(id);
  }
}
