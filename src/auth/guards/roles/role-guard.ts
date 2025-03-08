import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      console.log('User not found in request');
      return false;
    }

    const userCompaniesRole = await this.prisma.sys_UserCompaniesRole.findFirst(
      {
        where: { user_id: user.id },
        include: { role: true },
      },
    );

    if (!userCompaniesRole) {
      console.log('Role not found for user');
      return false;
    }

    console.log('User:', user);
    console.log('User Role:', userCompaniesRole.role);

    const hasRequiredRole = requiredRoles.includes(
      userCompaniesRole.role.id.trim(),
    );
    console.log('Has required role:', hasRequiredRole);
    return hasRequiredRole;
  }
}
