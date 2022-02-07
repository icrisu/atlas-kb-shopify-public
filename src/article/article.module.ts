import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ShopModule } from '../shop/shop.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleSchema } from './schemas/ArticleSchema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]), ShopModule],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
