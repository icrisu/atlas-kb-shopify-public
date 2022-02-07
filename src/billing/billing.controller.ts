import { Controller, Get, Query, HttpException, HttpStatus, Res, Req, Body } from '@nestjs/common';
import { ShopService } from '../shop/shop.service';
import * as _ from 'lodash';
import * as safe from 'undefsafe';
import { BillingService } from './billing.service';
import { Response } from 'express';
import { ShopifyService } from '../shared/services/shopify.service';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { LogReporterService } from '../shared/services/log.reporter.service';
import { Configuration } from '../shared/configuration/configuration.enum';
import { Perk } from './interfaces/Perk';
import { NotificationsService } from '../shared/notifications/notifications.service';

@Controller('billing')
export class BillingController {

    constructor(private readonly shopService: ShopService,
        private readonly billingService: BillingService,
        private readonly configService: ConfigurationService,
        private readonly LogReporter: LogReporterService,
        private readonly notificationService: NotificationsService) {}

    @Get('place/charge')
    async placeCharge(@Res() res: Response, @Query('shop') shop: string, @Query('key') key: string): Promise<any> {
        const shopData: any = await this.shopService.findOne({ shop });
        if (_.isNil(shopData)) {
            throw new HttpException('Shop must be installed first', HttpStatus.BAD_REQUEST);
        }
        const isActive: boolean = await this.billingService.isActive(shopData._id, key);
        if (isActive === true) {
            throw new HttpException('Charge already exists!', HttpStatus.BAD_REQUEST);
        }

        let price: number = this.billingService.getBillingConf(key).price;
        const perks: any[] = this.configService.getCollection(Configuration.PERKS);
        const pricePerk: Perk = _.find(perks, o => o.code === shopData.perks && o.type === 'price' );
        const trialPerk: Perk = _.find(perks, o => o.code === shopData.perks && o.type === 'trial' );

        if (!_.isNil(pricePerk) && (new Date().getTime() < new Date(pricePerk.expiresAt).getTime())) {
            price = price - price * (pricePerk.percentOff / 100);
        }

        let trialDaysDiscount: number;
        if (!_.isNil(trialPerk) && (new Date().getTime() < new Date(trialPerk.expiresAt).getTime())) {
            trialDaysDiscount = trialPerk.days;
        }

        const payload: any = {
            name: this.billingService.getBillingConf(key).name,
            price,
            return_url: `${this.configService.getAppBaseProxyUrl()}/billing/charge/status`,
            trial_days: this.billingService.getTrialDays(safe(shopData, 'firstChargeTrialPlacedAt'), key, trialDaysDiscount),
            test: this.billingService.isTestCharge(shop),
        };

        const applicationChargeData: any  = await new ShopifyService(shop, shopData.accessToken).shopify.recurringApplicationCharge.create(payload);
        await this.billingService.createCharge({
            charge_id: applicationChargeData.id,
            shopId: shopData._id,
            key,
            confirmation_url: applicationChargeData.confirmation_url,
            trial_days: applicationChargeData.trial_days,
        });
        res.redirect(applicationChargeData.confirmation_url);
    }

    @Get('charge/status')
    async activateCharge(@Res() res: Response, @Query('charge_id') charge_id: number): Promise<any> {
        const chargeData: any = await this.billingService.findOne({ charge_id });

        const shopData: any = await this.shopService.findById(chargeData.shopId);
        const { shop, accessToken } = shopData;

        const isActive: boolean = await this.billingService.isActive(shopData._id, chargeData.key);
        if (isActive === true) {
            return res.redirect(`/admin?shop=${shop}`);
        }

        const apiService: ShopifyService = new ShopifyService(shop, accessToken);
        const applicationChargeData: any  = await apiService.shopify.recurringApplicationCharge.get(charge_id);
        const chargeStatus: string = safe(applicationChargeData, 'status');
        const chargeIsActive: boolean = chargeStatus === 'accepted' || chargeStatus === 'active';
        if (!chargeIsActive) {
            throw new HttpException('Charge must be accepted first!', HttpStatus.EXPECTATION_FAILED);
        }

        await apiService.shopify.recurringApplicationCharge.activate(charge_id, {});

        try {
            await this.billingService.deleteMany({ shopId: shopData._id, charge_id: { $ne: charge_id }});
        } catch (err) {
            this.LogReporter.logError(err);
        }
        await this.billingService.setChargeActive(charge_id);

        const localChargeData: any = await this.billingService.findOne({ charge_id });
        const updateData: any = {
            charge: localChargeData._id,
        };

        this.notificationService.sendSlackNotification(`Charge activated - ${shop}`);

        if (_.isNil(shopData.firstChargeTrialPlacedAt)) {
            updateData.firstChargeTrialPlacedAt = Date.now();
        }
        await this.shopService.updateOne({ _id: shopData._id }, updateData);
        res.redirect(`/admin?shop=${shop}`);
    }
}
