import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Sys_CreateMenuDto } from './dto/sys_CreateMenu.dto';
import { Sys_UpdateMenuDto } from './dto/sys_UpdateMenu.dto';
import { Sys_ResponseMenuDto } from './dto/sys_ResponseMenu.dto';
import { Sys_MenuWithPermissionDto } from './dto/sys_MenuWithPermission.dto';
import { MenuItemDto } from './dto/sys_MenuItem.dto';

// import { Sys_MenuWithPermissionDto } from './dto/sys_MenuWithPermission.dto';

@Injectable()
export class sys_MenuService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuDto: Sys_CreateMenuDto): Promise<Sys_ResponseMenuDto> {
    const menu = await this.prisma.sys_Menu.create({
      data: createMenuDto,
    });

    // Jika menu baru adalah child, update parent has_child menjadi true
    if (menu.parent_id) {
      await this.prisma.sys_Menu.update({
        where: { id: menu.parent_id },
        data: { has_child: true },
      });
    }

    return this.mapToResponseDto(menu);
  }

  async findAll(company_id: string): Promise<Sys_MenuWithPermissionDto[]> {
    const menus = await this.prisma.sys_Menu.findMany({
      where: { company_id },
      include: {
        permissions: true,
        child: {
          include: {
            permissions: true,
          },
        },
      },
    });

    // Hanya return root menus, dan rekursi untuk menyusun hirarki child
    return menus
      .filter((menu) => !menu.parent_id)
      .map((menu) => this.mapToMenuWithPermissionDto(menu));
  }

  async findOne(id: number): Promise<Sys_ResponseMenuDto> {
    const menu = await this.prisma.sys_Menu.findUnique({
      where: { id },
      include: {
        permissions: true,
        child: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return this.mapToResponseDto(menu);
  }

  private mapToMenuItem(menu: any, allMenus: any[]): MenuItemDto {
    const childMenus = allMenus.filter((m) => m.parent_id === menu.id);

    // Jika menu memiliki "List", child-nya harus masuk ke multi_menu
    if (menu.menu_description === 'List') {
      return {
        title: menu.menu_description,
        href: menu.href || '#',
        icon: menu.icon || 'DefaultIcon',
        child: [], // Kosongkan child karena menggunakan multi_menu
        multi_menu: childMenus.map((child) => ({
          title: child.menu_description,
          href: child.href || '#',
          icon: child.icon || 'DefaultIcon',
          child: [],
          multi_menu: [],
          nested: [],
        })),
        nested: [],
      };
    }

    // Menu biasa tetap memiliki child
    return {
      title: menu.menu_description,
      href: menu.href || '#',
      icon: menu.icon || 'DefaultIcon',
      child: childMenus.map((child) => this.mapToMenuItem(child, allMenus)),
      multi_menu: [],
      nested: [],
    };
  }

  async findMenusWithPermissions(
    userCompanyRole_id: number,
  ): Promise<MenuItemDto[]> {
    const menus = await this.prisma.sys_Menu.findMany({
      where: {
        permissions: { some: { userCompanyRole_id } },
      },
      include: {
        permissions: true,
      },
    });

    const menuMap = new Map<number, any>();

    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, child: [] });
    });

    menus.forEach((menu) => {
      if (menu.parent_id) {
        const parentMenu = menuMap.get(menu.parent_id);
        if (parentMenu) {
          parentMenu.child.push(menuMap.get(menu.id));
        }
      }
    });

    const rootMenus = Array.from(menuMap.values()).filter(
      (menu) => !menu.parent_id,
    );

    function cleanEmptyArrays(menu: any): any {
      if (Array.isArray(menu.child) && menu.child.length === 0)
        delete menu.child;
      if (Array.isArray(menu.multi_menu) && menu.multi_menu.length === 0)
        delete menu.multi_menu;
      if (Array.isArray(menu.nested) && menu.nested.length === 0)
        delete menu.nested;

      if (menu.child) menu.child = menu.child.map(cleanEmptyArrays);
      if (menu.multi_menu)
        menu.multi_menu = menu.multi_menu.map(cleanEmptyArrays);
      if (menu.nested) menu.nested = menu.nested.map(cleanEmptyArrays);

      return menu;
    }

    return rootMenus.map((menu) =>
      cleanEmptyArrays(this.mapToMenuItem(menu, menus)),
    );
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
      parent_id: menu.parent_id || null,
      menu_description: menu.menu_description,
      href: menu.href || null,
      module_id: menu.module_id,
      menu_type: menu.menu_type || null,
      has_child: menu.has_child,
      icon: menu.icon || null,
      createdBy: menu.createdBy || null,
      createdAt: menu.createdAt,
      updatedBy: menu.updatedBy || null,
      updatedAt: menu.updatedAt || null,
      company_id: menu.company_id,
      branch_id: menu.branch_id,
      child: menu.child ? menu.child.map(this.mapToResponseDto) : [],
    };
  }

  private mapToMenuWithPermissionDto(menu: any): Sys_MenuWithPermissionDto {
    return {
      id: menu.id,
      parent_id: menu.parent_id,
      menu_description: menu.menu_description,
      href: menu.href,
      module_id: menu.module_id,
      menu_type: menu.menu_type,
      has_child: menu.has_child,
      icon: menu.icon,
      createdBy: menu.createdBy,
      createdAt: menu.createdAt,
      updatedBy: menu.updatedBy,
      updatedAt: menu.updatedAt,
      company_id: menu.company_id,
      branch_id: menu.branch_id,
      can_view: menu.permissions?.[0]?.can_view || false,
      can_create: menu.permissions?.[0]?.can_create || false,
      can_edit: menu.permissions?.[0]?.can_edit || false,
      can_delete: menu.permissions?.[0]?.can_delete || false,
      can_print: menu.permissions?.[0]?.can_print || false,
      can_approve: menu.permissions?.[0]?.can_approve || false,
      child: menu.child ? menu.child.map(this.mapToMenuWithPermissionDto) : [],
    };
  }
}
