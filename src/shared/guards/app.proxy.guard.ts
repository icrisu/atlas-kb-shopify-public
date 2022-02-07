import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as crypto from 'crypto';
import { CustomRequest } from '../interfaces/CustomRequest';
import { ConfigurationService } from '../configuration/configuration.service';
import { Configuration } from '../configuration/configuration.enum';
import * as safe from 'undefsafe';

@Injectable()
export class AppProxyGuard implements CanActivate {

    constructor(private readonly configService: ConfigurationService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req: CustomRequest = context.switchToHttp().getRequest();
        if (this.configService.isDevelopment === true) {
            return true;
        }

        if (!safe(req, 'query.signature')) {
            return false;
        }
        const parameters = [];
        for (const key in req.query) {
            if (key !== 'signature') {
                parameters.push(key + '=' + req.query[key]);
            }
        }
        const message: string = parameters.sort().join('');
        const secret: string = this.configService.get(Configuration.SHOPIFY_API_SECRET);
        const digest: string = crypto.createHmac('sha256', secret).update(message).digest('hex');
        const { signature } = req.query;

        return digest === signature;
    }
}
