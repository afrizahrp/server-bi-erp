import { Module } from '@nestjs/common';
import { BillboardsService } from './billboards.service';
import { BillboardsController } from './billboards.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [BillboardsController],
  providers: [BillboardsService, PrismaService],
})
export class BillboardsModule {}
