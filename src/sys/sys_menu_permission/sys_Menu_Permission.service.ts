import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Sys_CreateMenuPermissionDto } from './dto/sys_CreateMenuPermission.dto';
import { Sys_UpdateMenuPermissionDto } from './dto/sys_UpdateMenuPermission.dto';
import { Sys_ResponseMenuPermissionDto } from './dto/sys_ResponseMenuPermission.dto';

@Injectable()
export class sys_MenuPermissionService {
  constructor(private prisma: PrismaService) {}

  async create(
    createMenuPermissionDto: Sys_CreateMenuPermissionDto,
  ): Promise<Sys_ResponseMenuPermissionDto> {
    const menuPermission = await this.prisma.sys_Menu_Permission.create({
      data: createMenuPermissionDto,
    });
    return this.mapToResponseDto(menuPermission);
  }

  async findAll(company_id: string): Promise<Sys_ResponseMenuPermissionDto[]> {
    const menuPermissions = await this.prisma.sys_Menu_Permission.findMany({
      where: { company_id },
    });
    return menuPermissions.map(this.mapToResponseDto);
  }

  async findOne(id: number): Promise<Sys_ResponseMenuPermissionDto> {
    const menuPermission = await this.prisma.sys_Menu_Permission.findUnique({
      where: { id },
    });
    if (!menuPermission) {
      throw new NotFoundException(`Menu Permission with ID ${id} not found`);
    }
    return this.mapToResponseDto(menuPermission);
  }

  async update(
    id: number,
    updateMenuPermissionDto: Sys_UpdateMenuPermissionDto,
  ): Promise<Sys_ResponseMenuPermissionDto> {
    const menuPermission = await this.prisma.sys_Menu_Permission.findUnique({
      where: { id },
    });
    if (!menuPermission) {
      throw new NotFoundException(`Menu Permission with ID ${id} not found`);
    }
    const updatedMenuPermission = await this.prisma.sys_Menu_Permission.update({
      where: { id },
      data: updateMenuPermissionDto,
    });
    return this.mapToResponseDto(updatedMenuPermission);
  }

  async remove(id: number): Promise<void> {
    const menuPermission = await this.prisma.sys_Menu_Permission.findUnique({
      where: { id },
    });
    if (!menuPermission) {
      throw new NotFoundException(`Menu Permission with ID ${id} not found`);
    }
    await this.prisma.sys_Menu_Permission.delete({
      where: { id },
    });
  }

  private mapToResponseDto(menuPermission: any): Sys_ResponseMenuPermissionDto {
    return {
      id: menuPermission.id,
      userCompanyRole_id: menuPermission.userCompanyRole_id,
      menu_id: menuPermission.menu_id,
      can_view: menuPermission.can_view,
      can_create: menuPermission.can_create,
      can_edit: menuPermission.can_edit,
      can_delete: menuPermission.can_delete,
      can_print: menuPermission.can_print,
      can_approve: menuPermission.can_approve,
      iStatus: menuPermission.iStatus,
      createdBy: menuPermission.createdBy,
      createdAt: menuPermission.createdAt,
      updatedBy: menuPermission.updatedBy,
      updatedAt: menuPermission.updatedAt,
      company_id: menuPermission.company_id,
      branch_id: menuPermission.branch_id,
    };
  }
}
