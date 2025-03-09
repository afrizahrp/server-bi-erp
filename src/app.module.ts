import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { sys_UserModule } from './sys/sys_user/sys_User.module';
import { sys_UserCompaniesRoleModule } from './sys/sys_userCompaniesRole/sys_UserCompaniesRole.module';

import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { cms_BillboardsModule } from './cms/cms_billboards/cms_Billboards.module';
import { cms_CategoriesModule } from './cms/cms_categories/cms_Categories.module';
import { cms_ProductsModule } from './cms/cms_products/cms_Products.module';
import { cms_ProductDescsModule } from './cms/cms_productdescs/cms_ProductDescs.module';

import { imc_CategoriesModule } from './imc/imc_categories/imc_Categories.module';
import { imc_ProductsModule } from './imc/imc_products/imc_Products.module';

// import { CategoriesModule } from './im/im_categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    sys_UserModule,
    AuthModule,
    sys_UserCompaniesRoleModule,
    cms_CategoriesModule,
    cms_ProductsModule,
    cms_ProductDescsModule,
    cms_BillboardsModule,
    imc_CategoriesModule,
    imc_ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
