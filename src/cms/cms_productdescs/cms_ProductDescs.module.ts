import { Module } from '@nestjs/common';
import { cms_ProductDescsService } from './cms_ProductDescs.service';
import { PrismaService } from 'src/prisma.service';
import { cms_ProductDescsController } from './cms_ProductDescs.controller';

@Module({
  controllers: [cms_ProductDescsController],

  providers: [cms_ProductDescsService, PrismaService],
  exports: [cms_ProductDescsService],
})
export class cms_ProductDescsModule {}
