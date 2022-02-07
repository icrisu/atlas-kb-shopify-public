import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopSchema } from '../shared/schemas/ShopSchema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Shop', schema: ShopSchema }])],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
