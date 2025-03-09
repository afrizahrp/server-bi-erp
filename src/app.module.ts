import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { sys_UserModule } from './sys/sys_user/sys_User.module';
import { sys_UserCompanyRoleModule } from './sys/sys_userCompanyRole/sys_UserCompaniesRole.module';

import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { cms_BillboardsModule } from './cms/cms_billboard/cms_Billboard.module';
import { cms_CategoryModule } from './cms/cms_category/cms_Category.module';
import { cms_ProductModule } from './cms/cms_products/cms_Product.module';
import { cms_ProductDescModule } from './cms/cms_productdesc/cms_ProductDesc.module';

import { imc_CategoryModule } from './imc/imc_category/imc_Categories.module';
import { imc_ProductModule } from './imc/imc_product/imc_Product.module';

import { sys_CompanyModule } from './sys/sys_company/sys_Company.module';

import { sys_MenuModule } from './sys/sys_menu/sys_Menu.module';

import { sys_MenuPermissionModule } from './sys/sys_menu_permission/sys_Menu_Permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    sys_CompanyModule,
    sys_UserModule,
    sys_UserCompanyRoleModule,
    sys_MenuModule,
    sys_MenuPermissionModule,
    cms_CategoryModule,
    cms_ProductModule,
    cms_ProductDescModule,
    cms_BillboardsModule,
    imc_CategoryModule,
    imc_ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, sys_CompanyModule],
})
export class AppModule {}
