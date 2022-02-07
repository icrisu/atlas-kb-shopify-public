import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { Shop } from '../shared/interfaces/Shop';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ShopService extends BaseService<Shop> {
    constructor(@InjectModel('Shop') private readonly shopModel: Model<Shop>) {
        super();
        this.model = shopModel;
    }

    async getShopByDomain(shop): Promise<Shop> {
        return await this.findOne({ shop });
    }

    async getAllShopData(filter: any, selectFilter: string): Promise<Shop> {
        return this.model.findOne(filter)
        .populate('charge')
        .select(selectFilter).exec();
    }
}
