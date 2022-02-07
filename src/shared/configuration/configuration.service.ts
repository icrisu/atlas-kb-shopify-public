import { Injectable } from '@nestjs/common';
import { Configuration } from './configuration.enum';
import { get } from 'config';

@Injectable()
export class ConfigurationService {
    static defaultEnv: string = 'develop';
    static defaultAPIRoute: string = 'api';
    static mongoConnectionString: string = process.env[Configuration.MONGO_URI] || get(Configuration.MONGO_URI);
    private environmentHosting: string = process.env.NODE_ENV || ConfigurationService.defaultEnv;

    public get(key: string): any {
        return process.env[key] || get(key);
    }

    public getCollection(key: string): any[] {
        return get(key);
    }

    public get isDevelopment(): boolean {
        return this.environmentHosting === ConfigurationService.defaultEnv;
    }

    public getAppBaseProxyUrl(): string {
        return this.get(Configuration.HOST);
    }

    public getAppBaseUrl(): string {
        return this.isDevelopment ? `${this.get(Configuration.HOST)}:${get(Configuration.PORT)}` : this.get(Configuration.HOST);
    }

}
