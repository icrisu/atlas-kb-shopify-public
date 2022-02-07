import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ShopAuthService } from '../shop-auth/shop-auth.service';
import { CustomRequest } from '../interfaces/CustomRequest';
import * as querystring from 'querystring';
import { JWTService } from '../services/jwt.service';
import * as safe from 'undefsafe';
import { ShopService } from '../../shop/shop.service';

@Injectable()
export class ValidateAdminSignature implements CanActivate {

    constructor(private readonly reflector: Reflector,
        private readonly shopAuthService: ShopAuthService,
        private readonly jwtService: JWTService,
        private readonly shopService: ShopService) {}

    private _getShop(shop: string): Promise<any> {
        return this.shopService.getAllShopData({ shop }, 'impersonateToken');
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: CustomRequest = context.switchToHttp().getRequest();
        const queryStringRaw: string = req.get('x-admin-authorization');
        const qs: any = querystring.parse(req.get('x-admin-authorization').substr(1, queryStringRaw.length));
        const isValidSignature: boolean = this.shopAuthService.verifyHmac(qs);

        const shop: string = req.get('x-shop-origin') || '';
        const isValidShop: boolean = shop.search('myshopify.com') !== -1;
        if (!isValidShop) {
            return false;
        }

        const impersonateToken: string = `${req.get('x-impersonate-token')}` || '';
        const tokenData: any = this.jwtService.isValidToken(impersonateToken);
        const isValidImpersonateToken: boolean = impersonateToken !== '' && tokenData !== false && safe(tokenData, 'data.shop') === shop;
        if (isValidImpersonateToken === true) {
            try {
                const shopData: any = await this._getShop(shop);
                if (safe(shopData, 'impersonateToken') === impersonateToken) {
                    return true;
                }
                return false;
            } catch (err) {
                return false;
            }
        } else {
            return (isValidSignature === true) ? true : false;
        }
    }
}
