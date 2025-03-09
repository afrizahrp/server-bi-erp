import { Module } from '@nestjs/common';
import { cms_ProductsService } from './cms_Products.service';
import { cms_ProductsController } from './cms_Products.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [cms_ProductsController],
  providers: [cms_ProductsService, PrismaService],
  exports: [cms_ProductsService],
})
export class cms_ProductsModule {}
