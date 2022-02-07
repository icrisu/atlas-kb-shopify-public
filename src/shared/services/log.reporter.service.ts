import { AWSCloudWatchLogsService } from './aws.cloudwatch.logs.service';
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LogReporterService {

    constructor(private readonly cwLogsService: AWSCloudWatchLogsService) {}

    logError(error: any | string): void {
        /* tslint:disable */
        console.log('LOG REPORTER', error);
        /* tslint:enable */
        // CWService.getInstance().putLogObject(error);
    }

    log(message: any | string, logGroup?: string) {
        /* tslint:disable */
        console.log('LOG REPORTER', message);
        /* tslint:enable */
        // CWService.getInstance().putLogObject(message);
    }

    logInfo(info: any | string) {
        /* tslint:disable */
        console.log(info);
        /* tslint:enable */
    }
}
