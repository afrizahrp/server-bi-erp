import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { ProductsModule } from './cms/im_products/products.module';
import { CategoriesModule } from './cms/im_categories/categories.module';
import { UserCompaniesRoleModule } from './user-companies-role/user-companies-role.module';
import { ProductDescsModule } from './im_productdescs/product-descs.module';
import { BillboardsModule } from './cms/cms_billboards/billboards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    UserCompaniesRoleModule,
    ProductDescsModule,
    BillboardsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
