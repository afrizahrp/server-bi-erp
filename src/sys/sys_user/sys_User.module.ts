import { Module } from '@nestjs/common';
import { sys_UserService } from './sys_User.service';
import { sys_UserController } from './sys_User.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [sys_UserService, PrismaService, JwtService],
  controllers: [sys_UserController],
})
export class sys_UserModule {}
