import * as ShopifyAPI from 'shopify-api-node';
import { Configuration } from '../configuration/configuration.enum';
import { get } from 'config';

export class ShopifyService {

    private shopifyApi: ShopifyAPI;

    constructor(private readonly shopName: string, private readonly accessToken: string) {
        this.shopifyApi = new ShopifyAPI({
            shopName,
            password: accessToken,
            apiKey: process.env[Configuration.SHOPIFY_API_KEY] || get(Configuration.SHOPIFY_API_KEY),
            apiVersion: '2021-10'
        });
    }

    public get shopify(): ShopifyAPI {
        return this.shopifyApi;
    }
}
