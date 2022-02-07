import { Document } from 'mongoose';

export interface Charge extends Document {
    readonly charge_id: string;
    readonly shopId: string;
    readonly status?: string;
    readonly createdAt?: number;
    readonly key: string;
    readonly confirmation_url: string;
    readonly trial_days: number;
}
