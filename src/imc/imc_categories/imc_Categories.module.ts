import { Module } from '@nestjs/common';
import { imc_CategoriesService } from './imc_Categories.service';
import { imc_CategoriesController } from './imc_Categories.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [imc_CategoriesController],
  providers: [imc_CategoriesService, PrismaService],
})
export class imc_CategoriesModule {}
