import { Injectable, NestMiddleware, MiddlewareFunction, HttpException, HttpStatus } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { CustomRequest } from '../shared/interfaces/CustomRequest';
import { ShopService } from '../shop/shop.service';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import * as safe from 'undefsafe';
import * as _ from 'lodash';
import { Configuration } from '../shared/configuration/configuration.enum';
import { BILLING_STATUS } from '../billing/schemas/ChargeSchema';

@Injectable()
export class AppProxyMiddleware implements NestMiddleware {

    constructor(private readonly shopService: ShopService,
        private readonly configService: ConfigurationService) {}

    async resolve(...args: any[]): Promise<MiddlewareFunction> {
        return async (req: CustomRequest, res: Response, next: NextFunction) => {
            // let shop: string = req.get('x-forwarded-host');
            let shop: string = safe(req, 'query.shop');
            if (this.configService.isDevelopment) {
                shop = safe(req, 'query.shop');
            }
            const shopData: any = await this.shopService.getAllShopData({ shop }, '-impersonateToken');

            if (_.isNil(shopData)) {
                throw new HttpException('Missing shop!', HttpStatus.EXPECTATION_FAILED);
            }

            const billing: any = this.configService.get(Configuration.BILLING);
            const manadatoryPlanOnInstall: boolean | string = safe(billing, 'MANDATORY_PAYMENT_ON_INSTALL');

            const hasActiveCharge: boolean = !_.isNil(safe(shopData, 'charge.status')) && safe(shopData, 'charge.status') === BILLING_STATUS.ACTIVE;
            if (manadatoryPlanOnInstall !== false) {
                shopData.requiresCharge = true;
            }
            if (_.isString(manadatoryPlanOnInstall) && !hasActiveCharge) {
                throw new HttpException('Charge must be accepted first!', HttpStatus.EXPECTATION_FAILED);
            }

            req.shopData = shopData;
            next();
        };
    }
}
