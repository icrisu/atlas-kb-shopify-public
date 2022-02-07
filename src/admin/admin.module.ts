import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ShopModule } from '../shop/shop.module';
import { EmailModule } from '../email/email.module';
import { CategoryModule } from '../category/category.module';
import { ArticleModule } from '../article/article.module';
import { StorefrontAssetsModule } from '../storefront-assets/storefront-assets.module';

@Module({
	imports: [ShopModule, EmailModule, CategoryModule, ArticleModule, StorefrontAssetsModule],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
