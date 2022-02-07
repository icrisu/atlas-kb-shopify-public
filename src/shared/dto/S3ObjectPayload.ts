
export const enum S3ObjectContentType {
    IMG_PNG = 'img/png',
    JSON = 'application/json',
    IMAGE = 'image/jpeg',
    JAVASCRIPT = 'application/javascript',
    CSS = 'text/css',
    OCTET_STREAM = 'application/octet-stream',
}

export const enum S3ContentEncoding {
    GZIP = 'gzip',
}

export const enum S3_ACLS {
    PUBLIC_READ = 'public-read',
}

export class S3ObjectPayload {
    Bucket: string;
    Key: string;
    ACL: S3_ACLS;
    Body: any;
    ContentType: S3ObjectContentType.IMG_PNG | S3ObjectContentType.JSON
    | S3ObjectContentType.IMAGE | S3ObjectContentType.JAVASCRIPT | S3ObjectContentType.CSS
    | S3ObjectContentType.OCTET_STREAM;
    ContentEncoding?: S3ContentEncoding;
}
