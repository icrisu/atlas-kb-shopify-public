import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { Charge } from './interfaces/Charge';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { Configuration } from '../shared/configuration/configuration.enum';
import * as safe from 'undefsafe';
import * as _ from 'lodash';
import { BILLING_STATUS } from './schemas/ChargeSchema';

@Injectable()
export class BillingService extends BaseService<Charge> {

    private billingConf: any;

    constructor(@InjectModel('Charge') private readonly chargesModel: Model<Charge>,
        private readonly configService: ConfigurationService) {
        super();
        this.model = chargesModel;
        this.billingConf = this.configService.get(Configuration.BILLING);
    }

    async isActive(shopId: Types.ObjectId, key: string): Promise<boolean> {
        const billingData: any = await this.findOne({ shopId, key, status: BILLING_STATUS.ACTIVE });
        return billingData ? true : false;
    }

    getBillingConf(key: string): any {
        return safe(this.billingConf, `PACKAGES.${key}`);
    }

    getTrialDays(firstChargeTrialPlacedAt: Date, key: string, trialDaysDiscount: number): number {
        const defaultTrialDays: number = safe(this.billingConf, `TRIAL_DAYS`) || 1;
        let trialDays: number = safe(this.billingConf, `TRIAL_DAYS`);

        if (!_.isNil(trialDaysDiscount) && _.isNumber(trialDaysDiscount)) {
            trialDays = trialDaysDiscount;
        }

        if (!_.isNil(firstChargeTrialPlacedAt)) {
            const oneDay: number = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
            const now = new Date();
            const diffDays: number = Math.floor(Math.abs((firstChargeTrialPlacedAt.getTime() - now.getTime()) / (oneDay)));
            if (diffDays > 0 && diffDays < defaultTrialDays) {
                trialDays = defaultTrialDays - diffDays;
            } else if (diffDays > 0 && diffDays > defaultTrialDays) {
                trialDays = 0;
            } else if (diffDays === defaultTrialDays) {
                trialDays = 1;
            }
        }
        return trialDays;
    }

    isTestCharge(shop: string): boolean {
        const trialShops: string[] = safe(this.billingConf, `TEST_CHARGE_SHOPS`);
        return _.includes(trialShops, shop.toLocaleLowerCase());
    }

    createCharge(chargeData: any) {
        const charge: Charge = new this.model({...chargeData});
        return this.create(charge);
    }

    async setChargeActive(charge_id: number): Promise<Charge> {
        return this.updateOne({ charge_id }, { status: BILLING_STATUS.ACTIVE });
    }

    getMandatoryPaymentOnInstall(): string | boolean {
        const mpi: string = safe(this.billingConf, `MANDATORY_PAYMENT_ON_INSTALL`);
        if (!_.isNil(mpi) && _.isString(mpi)) {
            return mpi;
        }
        return false;
    }
}
