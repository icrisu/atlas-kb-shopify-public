export default class CreateShopDto {
    readonly shop: string;
    readonly accessToken: string;
    readonly email: string;
    readonly awsFolder: string;
    readonly shopMeta: any;
    readonly impersonateToken: string;
    readonly limits: {
        maxCategories: number,
        maxArticles: number,
        maxStorageSpace: number,
    };
    readonly locales: any;
    readonly settings: any;
    readonly perks?: string;
}
