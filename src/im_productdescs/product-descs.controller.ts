import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { ResponseProductDescsDto } from './dto/responseProductDescs.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { ProductDescsService } from './product-descs.service';

// @Controller('im-productdescs')
@Controller('cms/productdescs')
export class ProductDescsController {
  constructor(private readonly productdescsService: ProductDescsService) {}

  @Public()
  @Get(':id/:company_id')
  async findOne(
    @Param('id') id: string,
    @Param('company_id') company_id: string,
  ): Promise<ResponseProductDescsDto> {
    return this.productdescsService.findOne(id, company_id);
  }
}
