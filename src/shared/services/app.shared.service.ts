import { Injectable } from '@nestjs/common';
import { BaseService } from '../base.service';
import { App } from '../interfaces/App';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';

@Injectable()
export class AppSharedService extends BaseService<App> {

    constructor(@InjectModel('App') private readonly appModel: Model<App>) {
        super();
        this.model = appModel;
    }

    async getAppStatus(): Promise<any> {
        const appData: any = await this.findOne({ status: 'OK' });
        if (_.isNil(appData)) {
            const appD: App = new this.model({ status: 'OK' });
            await this.create(appD);
            return await this.findOne({ status: 'OK' });
        }
        return appData;
    }
}
