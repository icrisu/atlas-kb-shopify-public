import { Document } from 'mongoose';

export interface Asset extends Document {
    readonly shopId: any;
    readonly shop: string;
    readonly url: string;
    readonly Key: string;
    readonly size: number;
}
