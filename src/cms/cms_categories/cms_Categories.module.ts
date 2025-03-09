import { Module } from '@nestjs/common';
import { cms_CategoriesService } from './cms_Categories.service';
import { cms_CategoriesController } from './cms_Categories.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [cms_CategoriesController],
  providers: [cms_CategoriesService, PrismaService],
})
export class cms_CategoriesModule {}
