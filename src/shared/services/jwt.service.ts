import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../configuration/configuration.service';
import * as jsonwebtoken from 'jsonwebtoken';
import { Configuration } from '../configuration/configuration.enum';

@Injectable()
export class JWTService {
    constructor(private readonly configService: ConfigurationService) {}

    cterateImpersonateToken(shop: string): string {
        try {
            return jsonwebtoken.sign({
                data: {
                    shop, createdAt: Date.now(),
                },
            }, this.configService.get(Configuration.JWT_SECRET));
        } catch (err) {
            return '';
        }
    }

    isValidToken(token: string): boolean | any {
        let decoded: any;
        try {
            decoded = jsonwebtoken.verify(token, this.configService.get(Configuration.JWT_SECRET));
        } catch (err) {
            decoded = false;
        }
        return decoded;
    }
}
