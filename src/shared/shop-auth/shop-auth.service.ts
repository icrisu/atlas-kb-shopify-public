import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../configuration/configuration.service';
import * as ShopifyToken from 'shopify-token';
import { Configuration } from '../configuration/configuration.enum';
import { AuthUrlData } from '../dto/AuthUrlData';

@Injectable()
export class ShopAuthService {
    private shopifyToken: ShopifyToken;

    constructor(private readonly configService: ConfigurationService) {
        this.shopifyToken = new ShopifyToken({
            sharedSecret: this.configService.get(Configuration.SHOPIFY_API_SECRET),
            redirectUri: `${this.configService.getAppBaseProxyUrl()}/install-shop/auth/complete`,
            apiKey: this.configService.get(Configuration.SHOPIFY_API_KEY),
        });
    }

    buildAuthUrl(shop: string): AuthUrlData {
        const nonce = this.shopifyToken.generateNonce();
        const authUrl = this.shopifyToken.generateAuthUrl(shop, this.configService.get(Configuration.SHOP_ACCESS_SCOPES), nonce);
        return {
            authUrl, nonce,
        };
    }

    verifyHmac(query: any): boolean {
        return this.shopifyToken.verifyHmac(query);
    }

    getPermananetToken(shop: string, code: string): Promise<any> {
        return this.shopifyToken.getAccessToken(shop, code);
    }
}
