import { Document } from 'mongoose';

export interface Category extends Document {
    readonly shopId: any;
    readonly shop: string;
    readonly title: string;
    readonly slug: string;
    readonly slugMatchesTitle?: boolean;
    readonly shortDescription?: string;
    readonly icon: string;
    readonly customIcon?: string;
    readonly views?: number;
    readonly categoryColor?: string
}
