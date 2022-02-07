import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../configuration/configuration.service';
import * as AWS from 'aws-sdk';
import { Configuration } from '../configuration/configuration.enum';
import * as _ from 'lodash';
const CLOUDWATCH_LOGS_STREAM_NAME: string = 'unmatched_stream';

@Injectable()
export class AWSCloudWatchLogsService {

    private cwl: any;
    private nextSequenceStreamToken: string;
    private logStreams: any[];
    private groupName: string;

    constructor(private readonly configService: ConfigurationService) {
        const AWS_ACCESS: any = {
            accessKeyId: this.configService.get(Configuration.AWS_ACCESS_KEY),
            secretAccessKey: this.configService.get(Configuration.AWS_SECRET),
            region: this.configService.get(Configuration.AWS_REGION),
            apiVersion: '2014-03-28',
        };
        this.groupName = this.configService.get(Configuration.AWS_CLOUDWATCH_LOGS_GROUPNAME);
        if (!_.isNil(this.groupName) && !this.configService.isDevelopment) {
            this.cwl = new AWS.CloudWatchLogs(AWS_ACCESS);
            this._createLogStream()
            .then(() => {
                this._initStreamsForGroup();
            })
            .then(() => {
                /* tslint:disable */
                this.putLogObject(`Server ${this.configService.get(Configuration.APP_INTERNAL_KEY)} started, 
                CloudWatchLogs successfully initialized!`);
                /* tslint:enable */
            })
            .catch(err => {
                /* tslint:disable */
                console.log(err);
                /* tslint:enable */
            });
        }
    }

    private _createLogStream(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (_.isNil(this.cwl)) {
                /* tslint:disable */
                console.log('Something went wrong, CloudWatchLogs is not initializied');
                /* tslint:enable */
                return reject();
            }
            this._getLogStreams()
            .then((logStreams: any[]) => {
                this.logStreams = logStreams;
                if (!this._getLogStream(CLOUDWATCH_LOGS_STREAM_NAME)) {
                    this.cwl.createLogStream({
                        logGroupName: this.groupName,
                        logStreamName: CLOUDWATCH_LOGS_STREAM_NAME,
                    }, (err: any, data: any) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                } else {
                    resolve();
                }
            })
            .catch(err => {
                reject(err);
            });
        });
    }

    private _getLogStreams(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.cwl.describeLogStreams({
                logGroupName: this.groupName,
                descending: true,
            }, (err: any, data: any) => {
                if (err) {
                    reject(err);
                } else {
                    if (data.logStreams && _.isArray(data.logStreams)) {
                        return resolve(data.logStreams);
                    }
                    resolve([]);
                }
            });
        });
    }

    private _getLogStream(streamName: string) {
        let s: any;
        for (const stream of this.logStreams) {
            if (stream.logStreamName === streamName) {
                s = stream;
                break;
            }
        }
        return s;
    }

    private _initStreamsForGroup(): void {
        if (_.isNil(this.cwl)) {
            /* tslint:disable */
            console.log('Something went wrong, CloudWatchLogs is not initializied');
            /* tslint:enable */
            return;
        }
        if (this.logStreams) {
            const stream: any = this._getLogStream(CLOUDWATCH_LOGS_STREAM_NAME);
            if (stream && stream.uploadSequenceToken && stream.uploadSequenceToken !== '') {
                this.nextSequenceStreamToken = stream.uploadSequenceToken;
            }
        }
    }

    public putLogObject(payload: any): void {
        if (!this.cwl) {
            return;
        }
        let message: any = 'Unknow';
        if (_.isString(payload)) {
            message = payload;
        }
        if (_.isObject(payload) && !_.isNil(payload.stack) && _.isString(payload.stack)) {
            try {
                message = payload.stack;
            } catch (err) {
                /* tslint:disable */
                console.log(err);
                /* tslint:enable */
            }
        } else if (_.isObject(payload)) {
            try {
                message = JSON.stringify(payload);
            } catch (err) {
                /* tslint:disable */
                console.log(err);
                /* tslint:enable */
            }
        }

        const params: any = {
            logEvents: [ /* required */
                {
                    message, /* required */
                    timestamp: Date.now(),
                },
                /* more items */
            ],
            logGroupName: this.groupName,
            logStreamName: CLOUDWATCH_LOGS_STREAM_NAME,
        };
        if (this.nextSequenceStreamToken && this.nextSequenceStreamToken !== '') {
            params.sequenceToken = this.nextSequenceStreamToken;
        }
        this.cwl.putLogEvents(params, (err, data) => {
            if (err) {
                /* tslint:disable */
                console.log(err);
                /* tslint:enable */
            } else {
                this.nextSequenceStreamToken = data.nextSequenceToken;
                // console.log(data);
            }
        });
    }
}
