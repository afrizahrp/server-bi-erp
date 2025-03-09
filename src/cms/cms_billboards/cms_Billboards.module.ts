import { Module } from '@nestjs/common';
import { cms_BillboardsService } from './cms_Billboards.service';
import { cms_BillboardsController } from './cms_Billboards.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [cms_BillboardsController],
  providers: [cms_BillboardsService, PrismaService],
})
export class cms_BillboardsModule {}
