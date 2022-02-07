import { Document } from 'mongoose';

export interface Article extends Document {
    readonly shopId: any;
    readonly shop: string;
    readonly title: string;
    readonly slug: string;
    readonly content: string;
    readonly slugMatchesTitle?: boolean;
    readonly shortDescription?: string;
    readonly category?: string;
    readonly position?: number;
    readonly views?: number;
    readonly disappointed?: number;
    readonly neutral?: number;
    readonly happy?: number;
}
