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
      role_id = 2,
      image,
      company_id,
      // branch_id = company_id,
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
        role_id: Number(role_id),
        image,
        company_id,
        // branch_id,
        iStatus,
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

  // async updateIsLoggedIn(userId: number, isLoggedIn: boolean) {
  //   return await this.prisma.sys_User.update({
  //     where: {
  //       id: userId,
  //     },
  //     data: {
  //       isLoggedIn: isLoggedIn,
  //     },
  //   });
  // }

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
