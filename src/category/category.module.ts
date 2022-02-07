import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ShopModule } from '../shop/shop.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './schemas/CategorySchema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]), ShopModule],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
