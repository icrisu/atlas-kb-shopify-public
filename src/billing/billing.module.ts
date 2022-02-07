import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { ShopModule } from '../shop/shop.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChargeSchema } from './schemas/ChargeSchema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Charge', schema: ChargeSchema }]), ShopModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
