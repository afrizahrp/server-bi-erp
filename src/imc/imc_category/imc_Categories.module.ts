import { Module } from '@nestjs/common';
import { imc_CategoryService } from './imc_Category.service';
import { imc_CategoryController } from './imc_Category.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [imc_CategoryController],
  providers: [imc_CategoryService, PrismaService],
  exports: [imc_CategoryService],
})
export class imc_CategoryModule {}
