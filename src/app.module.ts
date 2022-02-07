import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { ConfigurationService } from './shared/configuration/configuration.service';
import { Configuration } from './shared/configuration/configuration.enum';
import { MongooseModule } from '@nestjs/mongoose';
import { InstallShopModule } from './install-shop/install-shop.module';
import { ShopModule } from './shop/shop.module';
import { ShopService } from './shop/shop.service';
import { WebhooksModule } from './webhooks/webhooks.module';
import { BillingModule } from './billing/billing.module';
import { StorefrontAssetsModule } from './storefront-assets/storefront-assets.module';
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';
import { AdminShopMiddleware } from './middlewares/admin.shop.middleware';
import { AppProxyMiddleware } from './middlewares/app.proxy.middleware';
import { AdminController } from './admin/admin.controller';
import { StorefrontAssetsService } from './storefront-assets/storefront-assets.service';
import { InstallShopService } from './install-shop/install-shop.service';
import { CategoryModule } from './category/category.module';
import { ArticleModule } from './article/article.module';
import { StorefrontModule } from './storefront/storefront.module';
import { StorefrontController } from './storefront/storefront.controller';
import { StorefrontAPIModule } from './storefront-api/storefront-api.module';
import { APIMiddleware } from './middlewares/api.midleware';
import { StorefrontAPIController } from './storefront-api/storefront-api.controller';

@Module({
imports: [SharedModule, MongooseModule.forRootAsync({
	imports: [SharedModule, StorefrontModule, StorefrontAPIModule],
	useFactory: async (configService: ConfigurationService) => ({
		uri: configService.get(Configuration.MONGO_URI),
		retryDelay: 500,
		retryAttempts: 5,
		useNewUrlParser: true,
		useCreateIndex: true,
	}),
	inject: [ConfigurationService],
}), InstallShopModule, ShopModule, WebhooksModule, BillingModule, StorefrontAssetsModule, EmailModule,
AdminModule, CategoryModule, ArticleModule],
	controllers: [AppController],
	providers: [AppService, ConfigurationService, ShopService, InstallShopService],
})

export class AppModule implements NestModule {
	static host: string;
	static port: number | string;
	static isDev: boolean;
	static sessionSecret: string;

	constructor(private readonly configurationService: ConfigurationService,
		private readonly storefrontAssetsService: StorefrontAssetsService) {
        AppModule.port = AppModule.normalizePort(configurationService.get(Configuration.PORT));
		AppModule.host = configurationService.get(Configuration.HOST);
		AppModule.isDev = configurationService.isDevelopment;
		AppModule.sessionSecret = configurationService.get(Configuration.SESSION_SECRET);
		this.storefrontAssetsService.onAppStart();
	}

	configure(consumer: MiddlewareConsumer) {
		consumer
		.apply(AdminShopMiddleware)
		.forRoutes(AdminController)
		.apply(AppProxyMiddleware)
		.forRoutes(StorefrontController)
		.apply(APIMiddleware)
		.forRoutes(StorefrontAPIController);
	}

    private static normalizePort(param: number | string): number | string {
        const portNumber: number = typeof param === 'string' ? parseInt(param, 10) : param;
        if (isNaN(portNumber)) {
			return param;
		} else if (portNumber >= 0) {
			return portNumber;
		}
    }
}
