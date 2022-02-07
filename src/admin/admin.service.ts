import { Injectable } from '@nestjs/common';
import { TRANSLATION_DATA } from './dto/translation';
import { APP_TUTORIALS } from './dto/appTutorials';
import * as request from 'request';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { Configuration } from '../shared/configuration/configuration.enum';

@Injectable()
export class AdminService {

    constructor(private readonly configService: ConfigurationService) {

    }

    getTranslation(): any {
        return TRANSLATION_DATA;
    }

    getAppTutorials(): any {
        return APP_TUTORIALS;
    }

    getOtherApps(): Promise<any> {
        return new Promise((resolve, reject) => {
            request(this.configService.get(Configuration.AWS_S3_OTHER_APPS_JSON), (error, response, body) => {
                if (error) {
                    return reject(error);
                }
                resolve(body);
            });
        });
    }
}
