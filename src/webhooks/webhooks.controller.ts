import { Controller, Post, UseGuards, Body, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ShopService } from '../shop/shop.service';
import { ValidateHeaderSignature } from '../shared/guards/validate.header.signature.guard';
import { BillingService } from '../billing/billing.service';
import { AWSS3Service } from '../shared/services/aws.s3.service';
import { LogReporterService } from '../shared/services/log.reporter.service';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { StorefrontAssetsService } from '../storefront-assets/storefront-assets.service';
import { CategoryService } from '../category/category.service';
import { ArticleService } from '../article/article.service';

@Controller('webhooks')
export class WebhooksController {

    constructor(private readonly shopService: ShopService,
        private readonly billingService: BillingService,
        private readonly awsS3Service: AWSS3Service,
        private readonly LogReporter: LogReporterService,
        private readonly notificationService: NotificationsService,
        private readonly storefrontAssetsService: StorefrontAssetsService,
        private readonly categoryService: CategoryService,
        private readonly articleService: ArticleService) {}

    @Post('app/uninstalled')
    @UseGuards(ValidateHeaderSignature)
    async uninstallApp(@Body() body: any, @Req() req: Request, @Res() res: Response): Promise<any> {
        res.status(200).send('OK');
        try {
            const shopData: any = await this.shopService.findOne({ shop: req.get('x-shopify-shop-domain') });
            await this.shopService.deleteOne({ shop: req.get('x-shopify-shop-domain') });
            await this.billingService.deleteMany({ shopId: shopData._id });
            this.storefrontAssetsService.deleteAllFromAWS(shopData._id);
            // await this.awsS3Service.deleteOne({
            //     Key: `${shopData.awsFolder}/index.js`,
            // });
            await this.storefrontAssetsService.deleteMany({ shopId: shopData._id });
            await this.categoryService.deleteMany({ shopId: shopData._id });
            await this.articleService.deleteMany({ shopId: shopData._id });
            this.notificationService.sendSlackNotification(`Shop uninstall - ${shopData.shop}`);
            this.LogReporter.logInfo('Shop deleted');
        } catch (err) {
            this.LogReporter.logError(err);
        }
    }

    @Post('customers/redact')
    @UseGuards(ValidateHeaderSignature)
    async customersRedact(@Body() body: any, @Req() req: Request, @Res() res: Response): Promise<any> {
        res.status(200).send('OK');
        // to be deleted if we store any orders
        // only if we have access to store's customers or orders
    }

    @Post('shop/redact')
    @UseGuards(ValidateHeaderSignature)
    async shopRedact(@Body() body: any, @Req() req: Request, @Res() res: Response): Promise<any> {
        res.status(200).send('OK');
        // this has already been deleted from the app/uninstalled hook
    }

    @Post('customers/data_request')
    @UseGuards(ValidateHeaderSignature)
    async customersDatarequest(@Body() body: any, @Req() req: Request, @Res() res: Response): Promise<any> {
        res.status(200).send('OK');
        // send the data if we have access to store's customers or orders
    }
}
