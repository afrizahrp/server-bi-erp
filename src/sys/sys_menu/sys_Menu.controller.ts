import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { sys_MenuService } from './sys_Menu.service';
import { Sys_CreateMenuDto } from './dto/sys_CreateMenu.dto';
import { Sys_UpdateMenuDto } from './dto/sys_UpdateMenu.dto';
import { Sys_ResponseMenuDto } from './dto/sys_ResponseMenu.dto';
import { Sys_MenuWithPermissionDto } from './dto/sys_MenuWithPermission.dto';
import { MenuItemDto } from './dto/sys_MenuItem.dto';

@Controller(':company_id/sys_menu')
export class sys_MenuController {
  constructor(private readonly menuService: sys_MenuService) {}

  @Post()
  async create(
    @Param('company_id') company_id: string,
    @Body() createMenuDto: Sys_CreateMenuDto,
  ): Promise<Sys_ResponseMenuDto> {
    return this.menuService.create({ ...createMenuDto, company_id });
  }

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
  ): Promise<Sys_ResponseMenuDto[]> {
    return this.menuService.findAll(company_id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Sys_ResponseMenuDto> {
    return this.menuService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: Sys_UpdateMenuDto,
  ): Promise<Sys_ResponseMenuDto> {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.menuService.remove(id);
  }

  @Public()
  @Get('permissions/:userCompanyRole_id')
  async findMenusWithPermissions(
    @Param('userCompanyRole_id') userCompanyRole_id: number,
  ): Promise<{ sidebarNav: { classic: MenuItemDto[] } }> {
    return this.menuService.findMenusWithPermissions(userCompanyRole_id);
  }
}
