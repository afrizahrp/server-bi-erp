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
      role_id = 1,
      image,
      iStatus = 1,
      isAuthorized = false,
      hashedRefreshToken = null,
    } = createUserDto;

    const hashedPassword = await hash(password);

    return await this.prisma.sys_User.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image,
        isAuthorized,
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
