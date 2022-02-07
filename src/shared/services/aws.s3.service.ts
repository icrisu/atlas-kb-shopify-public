import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../configuration/configuration.service';
import * as AWS from 'aws-sdk';
import { Configuration } from '../configuration/configuration.enum';
import * as _ from 'lodash';
import { S3ObjectPayload } from '../dto/S3ObjectPayload';
import { S3SimpleObjectPayload } from '../dto/S3SimpleObjectPayload';
import uuidv1 from 'uuid/v1';
import * as shortid from 'shortid';

@Injectable()
export class AWSS3Service {
    private s3: any;
    private _bucketUrl: string;
    private _defaultBucketName: string;

    constructor(private readonly configService: ConfigurationService) {
        this.s3 = new AWS.S3({
            apiVersion: this.configService.get(Configuration.AWS_API_VERSION),
            accessKeyId: this.configService.get(Configuration.AWS_ACCESS_KEY),
            secretAccessKey: this.configService.get(Configuration.AWS_SECRET),
            region: this.configService.get(Configuration.AWS_REGION),
        });
        this._bucketUrl = this.configService.get(Configuration.AWS_S3_BUCKET_URL);
        this._defaultBucketName = this.configService.get(Configuration.AWS_S3_BUCKET_NAME);
    }

    async getBuckets(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.s3.listBuckets({}, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    // create bucket if it does not exists
    public createBucket(bucketKeyName: string, permission: string, region: string): Promise<any> {
        return new Promise((resolve, reject) => {
            return this.getBuckets().then(buckets => {
                if (!_.isNil(buckets) && _.isArray(buckets.Buckets)) {
                    if (!this.bucketExists(buckets.Buckets, bucketKeyName)) {
                        const params = {
                            Bucket: bucketKeyName,
                            ACL: permission,
                            CreateBucketConfiguration: {
                                LocationConstraint: region,
                            },
                        };
                        this.s3.createBucket(params, (err, data: any) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(bucketKeyName);
                        });
                    } else {
                        resolve(bucketKeyName);
                    }
                }
            });
        });
    }

    // check if bucket exists
    bucketExists(buckets: any[], bucketName: string): boolean {
        let out: boolean = false;
        for (const bucket of buckets) {
            if (bucket.Name === bucketName) {
                out = true;
                break;
            }
        }
        return out;
    }

    public putObject(payload: S3ObjectPayload): Promise<S3SimpleObjectPayload> {
        return new Promise((resolve, reject) => {
            this.s3.putObject(payload).promise().then((data: any) => {
                resolve({
                    url: `${this._bucketUrl}/${payload.Key}`,
                    Key: payload.Key,
                });
            }).catch(reject);
        });
    }

    // delete many
    deleteMany(objects: S3SimpleObjectPayload[], bucketName?: string): Promise<any> {
        if (_.isArray(objects) && objects.length > 1000) {
            objects = objects.slice(0, 999);
        }
        const bName: string = bucketName || this._defaultBucketName;
        const params = {
            Bucket: bName,
            Delete: {
                Objects: objects,
            },
        };
        return this.s3.deleteObjects(params).promise();
    }

    // delete one
    deleteOne(object: S3SimpleObjectPayload, bucketName?: string): Promise<any> {
        const bName: string = bucketName || this._defaultBucketName;
        const params = {
            Bucket: bName,
            Key: object.Key,
        };
        return this.s3.deleteObject(params).promise();
    }

    static generateUuid(): string {
        return uuidv1();
    }

    static generateShortUuid(): string {
        return shortid.generate();
    }

    getDefaultBucketUrl(): string {
        return this._bucketUrl;
    }

    public get defaultBucketName(): string {
        return this._defaultBucketName;
    }
}
