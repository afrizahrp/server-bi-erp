import { Module } from '@nestjs/common';
import { imc_ProductStockCardService } from './imc_ProductStockCard.service';
import { imc_ProductStockCardController } from './imc_ProductStockCard.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [imc_ProductStockCardController],
  providers: [imc_ProductStockCardService, PrismaService],
})
export class imc_ProductStockCardModule {}
