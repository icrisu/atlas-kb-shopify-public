import { Module } from '@nestjs/common';
import { StorefrontAPIController } from './storefront-api.controller';
import { ShopModule } from '../shop/shop.module';
import { CategoryModule } from '../category/category.module';
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [ShopModule, CategoryModule, ArticleModule],
  controllers: [StorefrontAPIController],
})
export class StorefrontAPIModule {}
