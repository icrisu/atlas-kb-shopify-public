import { Controller, Get, Req, Res, Render, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Response, Request } from 'express';
import { EmailService } from './email/email.service';
import { ConfigService } from 'aws-sdk';
import { ConfigurationService } from './shared/configuration/configuration.service';
import { Configuration } from './shared/configuration/configuration.enum';
import { InstallShopService } from './install-shop/install-shop.service';
import * as url from 'url';
import { Perk } from './billing/interfaces/Perk';
import * as _ from 'lodash';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService,
		private readonly emailService: EmailService,
		private readonly configService: ConfigurationService,
		private readonly installShopService: InstallShopService) {}

	@Get('status')
	async status(@Res() res: Response): Promise<any> {
		// test purpose
		// const email = await this.emailService.sendWelcome(['crisu.ionel@gmail.com']);
		// console.log(email);
		// this.emailService.sendWelcome(['crisu.ionel@gmail.com']);
		// this.storefrontAssetsService.deleteAllFromAWS('5ca5c65632f3cf0cbd1580a3');
		const { status } = await this.appService.getStatus();
		res.status(200).json({ statusCode: status, Home: this.configService.get(Configuration.HOST) });
	}

	@Get('impersonate')
	@Render('impersonate')
	renderImpersonate() {
		return {};
	}

	@Get('documentation')
	@Render('documentation')
	renderDocumentation() {
		return {};
	}

	@Get('privacy-policy')
	@Render('privacy-policy')
	renderPrivacy() {
		return { appNamePretty: this.configService.get(Configuration.APP_NAME_PRETTY) };
	}

	@Get('terms')
	@Render('terms')
	renderTerms() {
		return { appNamePretty: this.configService.get(Configuration.APP_NAME_PRETTY) };
	}

	@Get('discount')
	@Render('discount')
	renderDiscount(@Query('code') code: string) {
		const perks: any[] = this.configService.getCollection(Configuration.PERKS);
        const pricePerk: Perk = _.find(perks, o => o.code === code && o.type === 'price' );
		const trialPerk: Perk = _.find(perks, o => o.code === code && o.type === 'trial' );
		const perksData: any[] = [];
		if (!_.isNil(pricePerk)) {
			perksData.push(pricePerk);
		}
		if (!_.isNil(trialPerk)) {
			perksData.push(trialPerk);
		}
		return {
			appNamePretty: this.configService.get(Configuration.APP_NAME_PRETTY),
			code,
			perks: perksData,
			host: this.configService.get(Configuration.HOST),
		};
	}

	@Get('redirect-admin')
	async redirectAdmin(@Query('shop') shop: string, @Req() req: Request, @Res() res: Response): Promise<any> {
		const search = url.parse(req.url).search;
        const exists = await this.installShopService.shopExists(shop);
        if (exists) {
            return res.redirect(`/admin${search}`);
		} else {
			return res.redirect(`/install-shop/auth${search}`);
		}
	}
}
