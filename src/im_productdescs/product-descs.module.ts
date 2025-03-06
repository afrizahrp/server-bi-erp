import { Module } from '@nestjs/common';
import { ProductDescsService } from './product-descs.service';
import { PrismaService } from 'src/prisma.service';
import { ProductDescsController } from './product-descs.controller';

@Module({
  controllers: [ProductDescsController],

  providers: [ProductDescsService, PrismaService],
  exports: [ProductDescsService],
})
export class ProductDescsModule {}
