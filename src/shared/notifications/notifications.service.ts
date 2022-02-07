import { Injectable } from '@nestjs/common';
import * as Slack from 'slack-node';
import { ConfigurationService } from '../configuration/configuration.service';
import { Configuration } from '../configuration/configuration.enum';

@Injectable()
export class NotificationsService {

    private _slack: Slack;
    private _appInternalKey: string;
    constructor(private readonly configService: ConfigurationService) {
        this._slack = new Slack();
        this._appInternalKey = this.configService.get(Configuration.APP_INTERNAL_KEY);
        this._slack.setWebhook(this.configService.get(Configuration.SLACK_WEBHOOK_URI));

    }

    sendSlackNotification(message: string, channel: string = '#eblocks'): void {
        this._slack.webhook({
                channel,
                username: 'Eblocks Bot',
                text: `${this._appInternalKey} - ${message}`,
          }, (err, response) => {
            // do nothing
        });
    }
}
