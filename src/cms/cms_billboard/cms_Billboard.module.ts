import { Module } from '@nestjs/common';
import { cms_BillboardService } from './cms_Billboard.service';
import { cms_BillboardController } from './cms_Billboard.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [cms_BillboardController],
  providers: [cms_BillboardService, PrismaService],
})
export class cms_BillboardsModule {}
