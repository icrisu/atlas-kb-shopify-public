import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ShopAuthService } from '../shop-auth/shop-auth.service';
import * as crypto from 'crypto';
import { CustomRequest } from '../interfaces/CustomRequest';
import { ConfigurationService } from '../configuration/configuration.service';
import { Configuration } from '../configuration/configuration.enum';

@Injectable()
export class ValidateHeaderSignature implements CanActivate {

    constructor(private readonly reflector: Reflector,
        private readonly shopAuthService: ShopAuthService,
        private readonly configService: ConfigurationService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req: CustomRequest = context.switchToHttp().getRequest();
        if (!req.rawBody) {
            return false;
        }
        const headers: any = req.headers || {};
        const hash = crypto.createHmac('sha256',
        this.configService.get(Configuration.SHOPIFY_API_SECRET)).update(req.rawBody, 'utf8').digest('base64');
        if (headers['x-shopify-hmac-sha256'] !== hash) {
            return false;
        }
        return true;
    }
}
