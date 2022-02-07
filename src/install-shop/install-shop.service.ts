import { Injectable, HttpCode } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { Shop } from '../shared/interfaces/Shop';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import CreateShopDto from '../shared/dto/CreateShopDto';

@Injectable()
export class InstallShopService extends BaseService<Shop> {

    constructor(@InjectModel('Shop') private readonly shopModel: Model<Shop>) {
        super();
        this.model = shopModel;
    }

    async shopExists(shop: string): Promise<boolean> {
        const shopData: any = await this.findOne({ shop });
        return !_.isNil(shopData);
    }

    async createShop(shopData: CreateShopDto): Promise<Shop> {
        return await this.create(new this.model({ ...shopData }));
    }
}
