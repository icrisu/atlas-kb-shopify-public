import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { ShopifyService } from '../shared/services/shopify.service';

@Injectable()
export class WebhooksService {
    constructor(private readonly configService: ConfigurationService) {}

    async createUninstallHook(shop: string, accessToken: string): Promise<any> {
        return await new ShopifyService(shop, accessToken).shopify.webhook.create({
            address: `${this.configService.getAppBaseProxyUrl()}/webhooks/app/uninstalled`,
            topic: 'app/uninstalled',
            format: 'json'
        });
    }
}
