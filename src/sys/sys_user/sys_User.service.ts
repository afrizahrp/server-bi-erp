import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Sys_CreateUserDto } from './dto/sys_CreateUser.dto';
import { hash } from 'argon2';

@Injectable()
export class sys_UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(sys_CreateUserDto: Sys_CreateUserDto) {
    const {
      name,
      email,
      password,
      image,
      iStatus = 'Active',
      isAdmin = false,
      hashedRefreshToken = null,
    } = sys_CreateUserDto;

    const hashedPassword = await hash(password);

    return await this.prisma.sys_User.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image,
        iStatus: 'Active',
        isAdmin,
        hashedRefreshToken,
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.sys_User.findUnique({
      where: {
        name,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.sys_User.findUnique({
      where: {
        id,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.sys_User.findUnique({
      where: {
        id,
      },
    });
  }

  async updateHashedRefreshToken(userId: number, hashedRT: string | null) {
    return await this.prisma.sys_User.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: hashedRT,
      },
    });
  }
}
