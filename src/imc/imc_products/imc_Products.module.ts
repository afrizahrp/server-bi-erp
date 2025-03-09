import { Module } from '@nestjs/common';
import { imc_ProductsService } from './imc_Products.service';
import { imc_ProductsController } from './imc_Products.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [imc_ProductsController],
  providers: [imc_ProductsService, PrismaService],
  exports: [imc_ProductsService],
})
export class imc_ProductsModule {}
