import { Module } from '@nestjs/common';
import { cms_CategoryService } from './cms_Category.service';
import { cms_CategoryController } from './cms_Category.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [cms_CategoryController],
  providers: [cms_CategoryService, PrismaService],
})
export class cms_CategoryModule {}
