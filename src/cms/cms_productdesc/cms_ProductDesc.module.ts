import { Module } from '@nestjs/common';
import { cms_ProductDescService } from './cms_ProductDesc.service';
import { PrismaService } from 'src/prisma.service';
import { cms_ProductDescController } from './cms_ProductDesc.controller';

@Module({
  controllers: [cms_ProductDescController],

  providers: [cms_ProductDescService, PrismaService],
  exports: [cms_ProductDescService],
})
export class cms_ProductDescModule {}
