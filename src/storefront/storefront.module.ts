import { Module } from '@nestjs/common';
import { StorefrontController } from './storefront.controller';
import { ShopModule } from '../shop/shop.module';
import { CategoryModule } from '../category/category.module';
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [ShopModule, CategoryModule, ArticleModule],
  controllers: [StorefrontController],
})
export class StorefrontModule {}
