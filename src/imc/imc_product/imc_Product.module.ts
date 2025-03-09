import { Module } from '@nestjs/common';
import { imc_ProductService } from './imc_Product.service';
import { imc_ProductController } from './imc_Product.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [imc_ProductController],
  providers: [imc_ProductService, PrismaService],
  exports: [imc_ProductService],
})
export class imc_ProductModule {}
