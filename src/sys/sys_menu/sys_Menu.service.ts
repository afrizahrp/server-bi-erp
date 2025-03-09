import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Sys_CreateMenuDto } from './dto/sys_CreateMenu.dto';
import { Sys_UpdateMenuDto } from './dto/sys_UpdateMenu.dto';
import { Sys_ResponseMenuDto } from './dto/sys_ResponseMenu.dto';

@Injectable()
export class sys_MenuService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: Sys_CreateMenuDto): Promise<Sys_ResponseMenuDto> {
    const menu = await this.prisma.sys_Menu.create({
      data: createMenuDto,
    });
    return this.mapToResponseDto(menu);
  }

  async findAll(company_id: string): Promise<Sys_ResponseMenuDto[]> {
    const menus = await this.prisma.sys_Menu.findMany({
      where: { company_id },
    });
    return menus.map(this.mapToResponseDto);
  }

  async findOne(id: number): Promise<Sys_ResponseMenuDto> {
    const menu = await this.prisma.sys_Menu.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    return this.mapToResponseDto(menu);
  }

  async update(
    id: number,
    updateMenuDto: Sys_UpdateMenuDto,
  ): Promise<Sys_ResponseMenuDto> {
    const menu = await this.prisma.sys_Menu.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    const updatedMenu = await this.prisma.sys_Menu.update({
      where: { id },
      data: updateMenuDto,
    });
    return this.mapToResponseDto(updatedMenu);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.prisma.sys_Menu.findUnique({
      where: { id },
    });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    await this.prisma.sys_Menu.delete({
      where: { id },
    });
  }

  private mapToResponseDto(menu: any): Sys_ResponseMenuDto {
    return {
      id: menu.id,
      parent_id: menu.parent_id,
      menu_description: menu.menu_description,
      href: menu.href,
      module_id: menu.module_id,
      menu_type: menu.menu_type,
      has_child: menu.has_child,
      icon: menu.icon,
      iStatus: menu.iStatus,
      createdBy: menu.createdBy,
      createdAt: menu.createdAt,
      updatedBy: menu.updatedBy,
      updatedAt: menu.updatedAt,
      company_id: menu.company_id,
      branch_id: menu.branch_id,
    };
  }
}
