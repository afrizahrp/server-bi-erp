import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const {
      name,
      email,
      password,
      image,
      iStatus = 'ACTIVE',
      isAdmin = false,
      hashedRefreshToken = null,
    } = createUserDto;

    const hashedPassword = await hash(password);

    return await this.prisma.sys_User.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image,
        iStatus: 'ACTIVE',
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
