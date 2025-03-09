import { Module } from '@nestjs/common';
import { cms_ProductService } from './cms_Product.service';
import { cms_ProductController } from './cms_Product.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [cms_ProductController],
  providers: [cms_ProductService, PrismaService],
  exports: [cms_ProductService],
})
export class cms_ProductModule {}
