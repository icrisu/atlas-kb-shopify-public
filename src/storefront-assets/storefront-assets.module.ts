import { Module } from '@nestjs/common';
import { StorefrontAssetsService } from './storefront-assets.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetSchema } from './schemas/AssetSchema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Asset', schema: AssetSchema }])],
  providers: [StorefrontAssetsService],
  exports: [StorefrontAssetsService],
})
export class StorefrontAssetsModule {}
