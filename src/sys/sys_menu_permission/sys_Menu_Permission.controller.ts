import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { sys_MenuPermissionService } from './sys_Menu_Permission.service';
import { Sys_CreateMenuPermissionDto } from './dto/sys_CreateMenuPermission.dto';
import { Sys_UpdateMenuPermissionDto } from './dto/sys_UpdateMenuPermission.dto';
import { Sys_ResponseMenuPermissionDto } from './dto/sys_ResponseMenuPermission.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller(':company_id/sys_menu_permission')
export class sys_MenuPermissionController {
  constructor(
    private readonly menuPermissionService: sys_MenuPermissionService,
  ) {}

  @Post()
  async create(
    @Body() createMenuPermissionDto: Sys_CreateMenuPermissionDto,
  ): Promise<Sys_ResponseMenuPermissionDto> {
    return this.menuPermissionService.create(createMenuPermissionDto);
  }

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
  ): Promise<Sys_ResponseMenuPermissionDto[]> {
    return this.menuPermissionService.findAll(company_id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<Sys_ResponseMenuPermissionDto> {
    return this.menuPermissionService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateMenuPermissionDto: Sys_UpdateMenuPermissionDto,
  ): Promise<Sys_ResponseMenuPermissionDto> {
    return this.menuPermissionService.update(id, updateMenuPermissionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.menuPermissionService.remove(id);
  }
}
