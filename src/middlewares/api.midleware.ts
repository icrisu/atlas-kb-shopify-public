import { Injectable, NestMiddleware, MiddlewareFunction, HttpException, HttpStatus } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { CustomRequest } from '../shared/interfaces/CustomRequest';
import { ShopService } from '../shop/shop.service';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import * as safe from 'undefsafe';
import * as _ from 'lodash';

@Injectable()
export class APIMiddleware implements NestMiddleware {

    constructor(private readonly shopService: ShopService,
        private readonly configService: ConfigurationService) {}

    async resolve(...args: any[]): Promise<MiddlewareFunction> {
        return async (req: CustomRequest, res: Response, next: NextFunction) => {
            let shop: string = safe(req, 'query.shop');
            const shopData: any = await this.shopService.getAllShopData({ shop }, '-impersonateToken');

            if (_.isNil(shopData)) {
                throw new HttpException('Missing shop!', HttpStatus.EXPECTATION_FAILED);
            }
            req.shopData = shopData;
            next();
        };
    }
}
