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

    const userRole = await this.prisma.sys_Roles.findUnique({
      where: { id: user.role_id }, // Trim the role_id to remove extra spaces
    });

    if (!userRole) {
      console.log('Role not found for user');
      return false;
    }

    console.log('User:', user);
    console.log('User Role:', userRole);

    // const hasRequiredRole = requiredRoles.includes(userRole.name.trim());
    const hasRequiredRole = requiredRoles.includes(user.role_id);

    // const hasRequiredRole = requiredRoles.some(
    //   (role) => role === userRole.name,
    // );

    // const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    console.log('Has required role:', hasRequiredRole);
    return hasRequiredRole;
  }
}
