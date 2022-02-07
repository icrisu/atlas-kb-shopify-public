import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ShopAuthService } from '../shop-auth/shop-auth.service';

@Injectable()
export class ValidateSignatureGuard implements CanActivate {

    constructor(private readonly reflector: Reflector,
        private readonly shopAuthService: ShopAuthService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req: Request = context.switchToHttp().getRequest();
        const query: any = req.query || {};
        const state: string = String(query.state);
        if (typeof state !== 'string' || state !== String(req.session.state) || !this.shopAuthService.verifyHmac(req.query)) {
            return false;
        }
        return true;
    }
}
