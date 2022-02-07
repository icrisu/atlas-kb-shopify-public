import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { CustomRequest } from '../shared/interfaces/CustomRequest';
import { ShopService } from '../shop/shop.service';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import * as safe from 'undefsafe';
import * as _ from 'lodash';
import { Configuration } from '../shared/configuration/configuration.enum';
import { BILLING_STATUS } from '../billing/schemas/ChargeSchema';

@Injectable()
export class AdminShopMiddleware implements NestMiddleware {

    constructor(private readonly shopService: ShopService,
        private readonly configService: ConfigurationService) {}

    async resolve(...args: any[]): Promise<MiddlewareFunction> {
        return async (req: CustomRequest, res: Response, next: NextFunction) => {
            const shop: string = req.get('x-shop-origin');
            const shopData: any = await this.shopService.getAllShopData({ shop }, '-impersonateToken');
            const billing: any = this.configService.get(Configuration.BILLING);
            const manadatoryPlanOnInstall: boolean | string = safe(billing, 'MANDATORY_PAYMENT_ON_INSTALL');
            const hasActiveCharge: boolean = !_.isNil(safe(shopData, 'charge.status')) && safe(shopData, 'charge.status') === BILLING_STATUS.ACTIVE;
            if (manadatoryPlanOnInstall !== false) {
                shopData.requiresCharge = true;
            }
            if (_.isString(manadatoryPlanOnInstall) && !hasActiveCharge) {
                const appBaseUrl: string = this.configService.getAppBaseProxyUrl();
                shopData.placeChargeUrl = `${appBaseUrl}/billing/place/charge?key=${manadatoryPlanOnInstall}&shop=${shop}`;
            }
            shopData.hasActiveCharge = hasActiveCharge;

            req.shopData = shopData;
            next();
        };
    }
}
