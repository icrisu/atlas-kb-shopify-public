import { Module } from '@nestjs/common';
import { InstallShopController } from './install-shop.controller';
import { InstallShopService } from './install-shop.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopSchema } from '../shared/schemas/ShopSchema';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { ShopModule } from '../shop/shop.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { BillingModule } from '../billing/billing.module';
import { BillingService } from '../billing/billing.service';
import { AWSS3Service } from '../shared/services/aws.s3.service';
import { StorefrontAssetsModule } from '../storefront-assets/storefront-assets.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Shop', schema: ShopSchema }]), ShopModule,
  WebhooksModule, BillingModule, StorefrontAssetsModule, EmailModule],
  controllers: [InstallShopController],
  providers: [InstallShopService, ConfigurationService, BillingService, AWSS3Service],
})
export class InstallShopModule {}
