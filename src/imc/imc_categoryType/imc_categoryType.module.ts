import { Module } from '@nestjs/common';
import { imc_CategoryTypeService } from './imc_categoryType.service';
import { imc_CategoryTypeController } from './imc_categoryType.controller';
import { PrismaService } from 'src/prisma.service';
@Module({
  controllers: [imc_CategoryTypeController],
  providers: [imc_CategoryTypeService, PrismaService],
  exports: [imc_CategoryTypeService],
})
export class imc_CategoryTypeModule {}
