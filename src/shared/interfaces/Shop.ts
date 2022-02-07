import { Document } from 'mongoose';

export interface Shop extends Document {
    readonly shop: string;
    readonly email: string;
    readonly firstChargeTrialPlacedAt: number;
    readonly firstInstallAt: number;
    readonly shopMeta: any;
    readonly awsFolder: string;
    readonly impersonateToken: string;
    readonly charge?: any;
    readonly locales?: any;
    readonly settings?: any;
    readonly perks?: string;
    readonly reviewInvitationSent?: boolean
}
