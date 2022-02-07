import { Injectable } from '@nestjs/common';
import * as sendGridAPI from '@sendgrid/mail';
import { get } from 'lodash';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { Configuration } from '../shared/configuration/configuration.enum';


type WelcomeEmailData = {
    firstName: string,
    appName?: string,
    docLinks: any[], // { url, label }
    documentationUrl: string,
    documentationLabel: string
}

@Injectable()
export class EmailService {

    constructor(private readonly configService: ConfigurationService) {
        sendGridAPI.setApiKey(this.configService.get(Configuration.SENDGRID_API_KEY));
    }

    async sendWelcome(toEmails: string[]): Promise<any> {
        const msg = {
            to: toEmails,
            from: this.configService.get(Configuration.SENDGRID_WELCOME_FROM_EMAIL),
            templateId: this.configService.get(Configuration.SENDGRID_WELCOME_TEMPLATE_ID),
            subject: this.configService.get(Configuration.SENDGRID_WELCOME_SUBJECT),
            dynamic_template_data: {
                AppName: this.configService.get(Configuration.APP_NAME_PRETTY),
                appstoreLink: this.configService.get(Configuration.APP_APSTORE_URL),
            },
        };
        return await sendGridAPI.send(msg);
    }

    // template welcome sakura apps
    async sendWelcomeNew(toEmails: string[], data: WelcomeEmailData): Promise<any> {
        const msg = {
            to: toEmails,
            from: {
                email: this.configService.get(Configuration.SENDGRID_WELCOME_FROM_EMAIL),
                name: 'SakuraApps - Get setup quickly'
            },
            reply_to: {
                email: this.configService.get(Configuration.SENDGRID_WELCOME_FROM_EMAIL),
                name: 'SakuraApps'
            },
            templateId: this.configService.get(Configuration.SENDGRID_WELCOME_TEMPLATE_ID),
            subject: this.configService.get(Configuration.SENDGRID_WELCOME_SUBJECT),
            dynamic_template_data: {
                ...data, appName: this.configService.get(Configuration.APP_NAME_PRETTY)
            },
        };
        return await sendGridAPI.send(msg);
    }

    async sendSupportEmail(fromEmail: string, message: string, fromName?: string): Promise<any> {
        const msg: any = {
            to: this.configService.get(Configuration.SENDGRID_SUPPORT_EMAIL),
            from: fromEmail,
            subject: `Support request - ${fromName} - ${this.configService.get(Configuration.APP_NAME_PRETTY)}`,
            text: message,
        };
        return await sendGridAPI.send(msg);
    }
}
