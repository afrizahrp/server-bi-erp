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

import { imc_CategoryTypeModule } from './imc/imc_categoryType/imc_categoryType.module';
import { imc_CategoryModule } from './imc/imc_category/imc_Categories.module';
import { imc_ProductModule } from './imc/imc_product/imc_Product.module';
import { imc_ProductStockCardModule } from './imc/imc_productStockCard/imc_ProductStockCard.module';

import { sys_CompanyModule } from './sys/sys_company/sys_Company.module';
import { sys_MenuModule } from './sys/sys_menu/sys_Menu.module';
import { sys_MenuPermissionModule } from './sys/sys_menu_permission/sys_Menu_Permission.module';

import { salesInvoiceHdModule } from './sales/salesInvoice/salesInvoiceHd/salesInvoiceHd.module';
import { salesInvoiceItemModule } from './sales/salesInvoice/salesInvoiceItem/salesInvoiceItem.module';

import { salesInvoiceDashboardModule } from './dashboard/sales/salesInvoice/salesInvoiceDashboard.module';
import { salesPersonPerformaDashboardModule } from './dashboard/sales/salesPerson-performa/salesPersonPerformaDashboard.module';

import { salesInvoiceAnalyticsModule } from './analytics/sales/salesInvoice/salesInvoiceAnalytics.module';
import { salesPersonPerformaAnalyticsModule } from './analytics/sales/salesPerson-performa/salesPersonPerformaAnalytics.module';

import { UploadController } from './cloudinary/cloudinary.controller';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

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
    imc_CategoryTypeModule,
    imc_CategoryModule,
    imc_ProductModule,
    imc_ProductStockCardModule,

    salesInvoiceHdModule,
    salesInvoiceItemModule,
    salesInvoiceDashboardModule,
    salesPersonPerformaDashboardModule,
    salesInvoiceAnalyticsModule,
    salesPersonPerformaAnalyticsModule,
    CloudinaryModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
