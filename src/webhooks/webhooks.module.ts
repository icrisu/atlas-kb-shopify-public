import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { ShopModule } from '../shop/shop.module';
import { BillingModule } from '../billing/billing.module';
import { StorefrontAssetsModule } from '../storefront-assets/storefront-assets.module';

@Module({
  imports: [ShopModule, BillingModule, StorefrontAssetsModule],
  providers: [WebhooksService],
  exports: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
