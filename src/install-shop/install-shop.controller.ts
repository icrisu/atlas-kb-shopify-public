import { Controller, Post, Get, Query, HttpException, HttpStatus, Req, Res, UseGuards, Body } from '@nestjs/common';
import { InstallShopService } from './install-shop.service';
import { Request, Response } from 'express';
import { AuthUrlData } from '../shared/dto/AuthUrlData';
import { ShopAuthService } from '../shared/shop-auth/shop-auth.service';
import { ValidateSignatureGuard } from '../shared/guards/validate.signature.guard';
import { ShopifyService } from '../shared/services/shopify.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { BillingService } from '../billing/billing.service';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { Configuration } from '../shared/configuration/configuration.enum';
import { AWSS3Service } from '../shared/services/aws.s3.service';
import { StorefrontAssetsService } from '../storefront-assets/storefront-assets.service';
import { LogReporterService } from '../shared/services/log.reporter.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { JWTService } from '../shared/services/jwt.service';
import * as _ from 'lodash';

const locales: any = {
    title: `Advice and answers from our team`,
    searchPlaceholder: `Search for articles...`,
    catOneArticle: `<%= articlesNo %> article found in this collection.`,
    catMultipleArticls: `<%= articlesNo %> articles found in this collection.`,
    catNoArticles: `0 articles found in this category.`,
    categoriesNotFound: `There are no published categories`,
    categoryNotFound: `Category not found`,
    articleNotFound: `Article not found`,
    navAllCategories: `All categories`,
    ratingQuestion: `Did this answer your question?`,
    searchResultTitle: `Search results for:`,
    invalidSearchTerm: `Invalid search term`,
    resultsNotFound: `No search results found`,
    searchResultNavLabel: `Search results`,
    articleReadMore: `Read more`,
    recentlyViewed: `Recently viewed`,
    popularArticle: `Popular articles`,
    launcherTitle: `Help Center`,
    launcherAllCollections: `All topics`,
};
const settings: any = {
    lookAndFeel: `startup`,
    linkedin: ``,
    facebook: ``,
    twitter: ``,
    contactUrl: ``,
    contactLabel: `Contact us`,
    customCss: ``,
    customJSTop: ``,
    customJSBottom: ``,
    customWidgetCode: ``,
    showLauncher: false,
    launcherColor1: `#2f4ae0`,
    launcherColor2: `#1c34b8`,
    launcherCustomIcon: null,
    launcherCustomCSS: ``,
    showLauncherOnHelpPages: false
};

@Controller('install-shop')
export class InstallShopController {
    constructor(private readonly installShopService: InstallShopService,
    private readonly shopAuthService: ShopAuthService,
    private readonly webHookService: WebhooksService,
    private readonly billingService: BillingService,
    private readonly configService: ConfigurationService,
    private readonly storefrontAssetsService: StorefrontAssetsService,
    private readonly LogReporter: LogReporterService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationsService,
    private readonly jwtService: JWTService) {}

    @Get('auth/complete')
    @UseGuards(ValidateSignatureGuard)
    async complete(@Query() query: any, @Req() req: Request, @Res() res: Response): Promise<any> {
        const exists = await this.installShopService.shopExists(query.shop);
        if (exists) {
            return res.redirect(`/admin?shop=${query.shop}`);
        }
        req.session.state = undefined;
        const { access_token } = await this.shopAuthService.getPermananetToken(query.shop, query.code);
        const shopMeta: any  = await new ShopifyService(query.shop, access_token).shopify.shop.get();
        const awsFolder: string = AWSS3Service.generateShortUuid();
        await this.installShopService.createShop({
            shop: query.shop,
            accessToken: access_token,
            email: shopMeta.email,
            awsFolder,
            shopMeta,
            impersonateToken: this.jwtService.cterateImpersonateToken(query.shop),
            limits: {
                maxCategories: this.configService.get(Configuration.MAX_CATEGORIES),
                maxArticles: this.configService.get(Configuration.MAX_ARTICLES),
                maxStorageSpace: this.configService.get(Configuration.MAX_STORAGE_SPACE),
            },
            locales,
            settings,
            perks: req.session.perks,
        });
        req.session.perks = undefined;
        try {
            await this.webHookService.createUninstallHook(query.shop, access_token);
        } catch (err) {
            console.log('ERROR>>> webhook');
            this.LogReporter.logError(err);
        }

        if (this.configService.get(Configuration.PLACE_SCRIP_TAG_ON_INSTALL)) {
            try {
                this.storefrontAssetsService.crateMainScriptTag(awsFolder, query.shop, access_token);
            } catch (err) { this.LogReporter.logError(err); }
        }

        if (this.configService.get(Configuration.SEND_WELCOME_EMAIL)) {
            try {
                // this.emailService.sendWelcome([shopMeta.email]);
                const shopOwner: string = _.get(shopMeta, 'shop_owner', '');
                this.emailService.sendWelcomeNew([_.get(shopMeta, 'email', '')], {
                    firstName: shopOwner.substr(0, shopOwner.indexOf(' ')),
                    docLinks: [
                        { url: 'https://atlas.sakura-ftl.com/documentation#proxy', label: 'Integrate Atlas - Help Center within your shop storefront'},
                        { url: 'https://atlas.sakura-ftl.com/documentation#atlas-launcher', label: 'Setup Atlas Launcher storefront widget'}
                    ],
                    documentationUrl: 'https://atlas.sakura-ftl.com/documentation',
                    documentationLabel: 'Documentation'
                })
            } catch (err) {
                this.LogReporter.logError(err);
            }
        }

        this.notificationService.sendSlackNotification(`New shop install - ${query.shop}`);

        const mandatoryPaymentKey: string | boolean = this.billingService.getMandatoryPaymentOnInstall();
        if (mandatoryPaymentKey) {
            return res.redirect(`/billing/place/charge?key=${mandatoryPaymentKey}&shop=${query.shop}`);
        }
        return res.redirect(`/admin?shop=${query.shop}`);
    }

    @Get('auth')
    async auth(@Query('shop') shop: string, @Query('perks') perks: string, @Req() req: Request, @Res() res: Response): Promise<any> {
        if (!shop || shop.search('myshopify.com') === -1) {
            throw new HttpException('Shopify domain is required', HttpStatus.BAD_REQUEST);
        }
        const exists = await this.installShopService.shopExists(shop);
        if (exists) {
            return res.redirect(`/admin?shop=${shop}`);
        }
        const authUrlDta: AuthUrlData = this.shopAuthService.buildAuthUrl(shop);
        req.session.state = authUrlDta.nonce;
        if (!_.isNil(perks)) {
            req.session.perks = perks;
        }
        res.redirect(authUrlDta.authUrl);
    }
}
