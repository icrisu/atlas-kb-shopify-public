import { Request } from 'express';

export interface CustomRequest extends Request {
    rawBody: any;
    shopData?: any;
    files?: any;
}
