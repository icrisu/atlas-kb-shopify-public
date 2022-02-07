import { Injectable } from '@nestjs/common';
import { AWSS3Service } from '../shared/services/aws.s3.service';
import { S3ObjectContentType, S3_ACLS } from '../shared/dto/S3ObjectPayload';
import { ShopifyService } from '../shared/services/shopify.service';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { Configuration } from '../shared/configuration/configuration.enum';
import * as UglifyJS from 'uglify-js';
import * as uuidv1 from 'uuid/v1';
import hexRgb from 'hex-rgb';
import { join } from 'path';
import { get, isArray, isNil } from 'lodash';
import * as fs from 'fs';
import { BaseService } from '../shared/base.service';
import { Asset } from './interfaces/Asset';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Utils from '../utils/Utils';

@Injectable()
export class StorefrontAssetsService extends BaseService<Asset> {

    private mainJs: string = '';
    private mainCss: string = '';

    constructor(@InjectModel('Asset') private readonly assetModel: Model<Asset>,
        private readonly awsS3Service: AWSS3Service,
        private readonly configService: ConfigurationService) {
            super();
            this.model = assetModel;
        }

    async crateMainScriptTag(awsFolder: string, shop: string, accessToken: string): Promise<any> {
        const apiService: ShopifyService = new ShopifyService(shop, accessToken);
        await apiService.shopify.scriptTag.create({
            event: 'onload',
            src: `${this.awsS3Service.getDefaultBucketUrl()}/${awsFolder}/index.js`,
        });

        const maifestLocalhostURL: string = `${this.configService.getAppBaseProxyUrl()}/unmatched-storefront/manifest.json`;
        const manifestProductionURL: string = `${this.configService.get(Configuration.AWS_S3_BUCKET_URL)}/manifest.json`;
        const mainifestUrl: string = this.configService.isDevelopment ? maifestLocalhostURL : manifestProductionURL;
        const minified: any = UglifyJS.minify(`
            (function () {
                window.${this.configService.get(Configuration.APP_INTERNAL_KEY)}_config = function() {
                    return {
                        SHOP: "${shop}",
                        API_ROOT: "${this.configService.getAppBaseProxyUrl()}/api"
                    }
                };
                var mainifestUrl = "${mainifestUrl}";
                var Http = new XMLHttpRequest();
                var url = mainifestUrl;
                Http.open("GET", url);
                Http.send();
                Http.onreadystatechange = function(e) {
                    if (this.readyState === 4 && this.status === 200) {
                        try {
                            var parsedData = JSON.parse(Http.responseText);
                            var head = document.getElementsByTagName("head")[0];
                            var script = document.createElement("script");
                            script.type = "text/javascript";
                            script.src = parsedData.app;
                            head.appendChild(script);

                            var link = document.createElement("link");
                            link.rel = "stylesheet";
                            link.href = parsedData.css;
                            head.appendChild(link);
                        } catch (err) { console.log(err) };
                    }
                }
            }());
            `);
        return await this.awsS3Service.putObject({
            Bucket: this.awsS3Service.defaultBucketName,
            Key: `${awsFolder}/index.js`,
            ContentType: S3ObjectContentType.JAVASCRIPT,
            ACL: S3_ACLS.PUBLIC_READ,
            Body: minified.code,
        });
    }

    public get mainJSContent(): string {
        return this.mainJs;
    }

    public get mainCSSContent(): string {
        return this.mainCss;
    }

    private _readAssetFile(assetName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(join(__dirname, '../..', 'src-storefront/dist/storefront', assetName), 'utf8', (err, contents: string) => {
                if (err) {
                    return reject(err);
                }
                return resolve(contents);
            });
        });
    }

    private _readAssetFileFromPath(path: string, encoding: string = 'utf8'): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, encoding, (err, contents: string) => {
                if (err) {
                    return reject(err);
                }
                return resolve(contents);
            });
        });
    }

    private _putAWSObjectHelper(key: string, body: string, contentType: any): Promise<any> {
        return this.awsS3Service.putObject({
            Bucket: this.awsS3Service.defaultBucketName,
            Key: `${key}`,
            ContentType: contentType,
            ACL: S3_ACLS.PUBLIC_READ,
            Body: body,
        });
    }

    async onAppStart(): Promise<any> {
        if (this.configService.isDevelopment) {
            return;
        }
        try {
            this.mainJs = await this._readAssetFile('index.js');
            this.mainCss = await this._readAssetFile('index.css');
            const launcherJSData: any = await this._readAssetFileFromPath(join(__dirname, '../..', 'src-storefront-launcher/dist', 'atlas-launcher.js'), 'utf8');
            const launcherHelpIcon: any = await this._readAssetFileFromPath(join(__dirname, '../..', 'src-storefront-launcher/dist/images', 'help-icon.png'), null);
            const launcherCloseIcon: any = await this._readAssetFileFromPath(join(__dirname, '../..', 'src-storefront-launcher/dist/images', 'launcher-close-icon.png'), null);
            const preloaderIcon: any = await this._readAssetFileFromPath(join(__dirname, '../..', 'src-storefront-launcher/dist/images', 'preloader.gif'), null);

            const fontsBasePath: any = join('../..', 'public/icon-fonts');
            let iconStyle: any = await this._readAssetFileFromPath(join(__dirname, fontsBasePath, 'style.css'), 'utf8');
            iconStyle = this._addContentToIconsCSS(iconStyle, this.awsS3Service.getDefaultBucketUrl())
            const eot: any = await this._readAssetFileFromPath(join(__dirname, fontsBasePath, '/fonts', 'unfold.eot'), null);
            const svg: any = await this._readAssetFileFromPath(join(__dirname, fontsBasePath, '/fonts', 'unfold.svg'), null);
            const ttf: any = await this._readAssetFileFromPath(join(__dirname, fontsBasePath, '/fonts', 'unfold.ttf'), null);
            const woff: any = await this._readAssetFileFromPath(join(__dirname, fontsBasePath, '/fonts', 'unfold.woff'), null);

            await this._putAWSObjectHelper('index.js', this.mainJs, S3ObjectContentType.JAVASCRIPT);
            await this._putAWSObjectHelper('index.css', this.mainCss, S3ObjectContentType.CSS);
            await this._putAWSObjectHelper('atlas-launcher.js', launcherJSData, S3ObjectContentType.JAVASCRIPT);
            await this._putAWSObjectHelper('help-icon.png', launcherHelpIcon, S3ObjectContentType.IMG_PNG);
            await this._putAWSObjectHelper('launcher-close-icon.png', launcherCloseIcon, S3ObjectContentType.IMG_PNG);
            await this._putAWSObjectHelper('preloader.gif', preloaderIcon, S3ObjectContentType.IMG_PNG);
            await this._putAWSObjectHelper('style.css', iconStyle, S3ObjectContentType.CSS);
            await this._putAWSObjectHelper('unfold.eot', eot, S3ObjectContentType.OCTET_STREAM);
            await this._putAWSObjectHelper('unfold.svg', svg, S3ObjectContentType.OCTET_STREAM);
            await this._putAWSObjectHelper('unfold.ttf', ttf, S3ObjectContentType.OCTET_STREAM);
            await this._putAWSObjectHelper('unfold.woff', woff, S3ObjectContentType.OCTET_STREAM);
            console.log('AWS COMPLETE - on startup')
        } catch (err) {
            /* tslint:disable */
            console.log(err);
            /* tslint:enable */
        }
    }

    uploadPhoto(key: string, data: any): Promise<any> {
        return this.awsS3Service.putObject({
            Bucket: this.awsS3Service.defaultBucketName,
            Key: `${key}`,
            ContentType: S3ObjectContentType.IMG_PNG,
            ACL: S3_ACLS.PUBLIC_READ,
            Body: data,
        });
    }

    saveAssetToDB(shop: string, shopId: any, assetdata: {url: string, Key: string, size: number}) {
        // url: string, Key: string, size: Number
        const asset: Asset = new this.model({shop, shopId, ...assetdata });
        return this.create(asset);
    }

    async getTotalFilesSize(shopId: any): Promise<any> {
        /* tslint:disable */
        return await this.model.aggregate(
            [
                { $match : { shopId }},
                {
                    $group:
                    {
                        _id: null,
                        totalSize: { $sum: '$size' },
                    }
                }
            ]
        );
        /* tslint:enable */
    }

    async deleteAllFromAWS(shopId: any): Promise<any> {
        try {
            const allKeysRaw = await this.findAllWithSelect({ shopId: this.toObjectId(shopId) }, 'Key -_id');
            const allKeys = allKeysRaw.map(item => {
                return { Key: item.Key };
            });
            const allChunks: any[] = Utils.chunkArray(allKeys, 800);
            if (allChunks.length > 0) {
                for (const iterator of allChunks) {
                    // console.log(iterator);
                    this.awsS3Service.deleteMany(iterator, this.configService.get(Configuration.AWS_S3_BUCKET_NAME));
                }
            }
        } catch (err) {
            // console.log(err);
        }
    }

    private _addContentToIconsCSS(originalData: any, awsFolderUrl: any) {
        return `
@font-face {
font-family: 'unfold';
src:  url('${awsFolderUrl}/unfold.eot?efj2fh');
src:  url('${awsFolderUrl}/unfold.eot?efj2fh#iefix') format('embedded-opentype'),
    url('${awsFolderUrl}/unfold.ttf?efj2fh') format('truetype'),
    url('${awsFolderUrl}/unfold.woff?efj2fh') format('woff'),
    url('${awsFolderUrl}/unfold.svg?efj2fh#unfold') format('svg');
font-weight: normal;
font-style: normal;
font-display: block;
}
        ${originalData}
        `;
    }

    public async handleStorefrontScriptTag(shopData: any, settingsNew: any) {
        const { accessToken, shop, awsFolder } = shopData;
        const apiService: ShopifyService = new ShopifyService(shop, accessToken);
        const scriptTags: any = await apiService.shopify.scriptTag.list();
        const showLauncher: any = get(settingsNew, 'showLauncher', false);
        if (showLauncher === false) {
            if (isArray(scriptTags) && scriptTags.length > 0) {
                await this.deleteAllScriptTags(shopData, scriptTags);
            }
            return;
        }
        try {
            this._placeUserScriptContentOnAws(shopData, settingsNew);
        } catch(err) {
            console.log('AWS err', err);
        }
        try {
            if (isArray(scriptTags) && scriptTags.length > 0) {
                await this.deleteAllScriptTags(shopData, scriptTags);
            }
    
            await apiService.shopify.scriptTag.create({
                event: 'onload',
                src: `${this.awsS3Service.getDefaultBucketUrl()}/${awsFolder}/config.js`,
            });
        } catch (err) {
            console.log('Script tag error ', err);
        }
    }

    public async deleteAllScriptTags(shopData: any, scriptTags: any[]): Promise<any> {
        const { accessToken, shop } = shopData;
        const apiService: ShopifyService = new ShopifyService(shop, accessToken);
        const promises: any[] = [];
        for (let i = 0; i < scriptTags.length; i++) {
            promises.push(apiService.shopify.scriptTag.delete(get(scriptTags, `[${i}].id`)))
        }
        return Promise.all(promises);
    }

    private async _placeUserScriptContentOnAws(shopData: any, newSettings: {}) {
        let launcherCustomIcon: any = get(newSettings, 'launcherCustomIcon', null);
        if (isNil(launcherCustomIcon) || launcherCustomIcon === '') {
            launcherCustomIcon = `${this.awsS3Service.getDefaultBucketUrl()}/help-icon.png`;
        }
        const launcherJSUrl: any = this.configService.isDevelopment ? `${this.configService.getAppBaseProxyUrl()}/atlas-launcher.js?v=${uuidv1()}` : `${this.awsS3Service.getDefaultBucketUrl()}/atlas-launcher.js?v=${uuidv1()}`;
        const customCSS: any = get(newSettings, 'launcherCustomCSS', '')
        let cssRaw: any = [
            '.atlas-launcher-base .atlas-launcher-header {',
                `background: ${get(newSettings, 'launcherColor1', '#2f4ae0')};`,
                `background: linear-gradient(135deg, ${get(newSettings, 'launcherColor1', '#2f4ae0')} 0%, ${get(newSettings, 'launcherColor2', '#1c34b8')} 100%);`,
            '}',
            '.atlas-launcher-button {',
                `background: ${get(newSettings, 'launcherColor2', '#1c34b8')};`,
            '}',
            `${customCSS}`
        ].join('');
        const rawData: any = `
        (function(){
            try {
                window.atlasHlpcSetting = {
                    launcherCloseIcon: '${this.awsS3Service.getDefaultBucketUrl()}/launcher-close-icon.png',
                    launcherIcon: '${launcherCustomIcon}',
                    preloader: '${this.awsS3Service.getDefaultBucketUrl()}/preloader.gif'
                }
                var head = document.getElementsByTagName("head")[0];
                var link = document.createElement("link");
                link.rel = 'stylesheet';
                link.href = '${this.awsS3Service.getDefaultBucketUrl()}/style.css?v=${uuidv1()}';
                head.appendChild(link);

                window.atlasHlpcInitialSetting = {
                  shop: "${get(shopData, 'shop', '')}",
                  apiRoot: "${this.configService.getAppBaseProxyUrl()}/storefront-api"
                }
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.src = "${launcherJSUrl}";
                head.appendChild(script);

                var style = document.createElement('style');
                style.innerHTML = "${cssRaw}";
                document.body.appendChild(style);
              } catch (err) {
                console.log(err);
              }
        })()
        `;
        const key: string = `${get(shopData, 'awsFolder')}/config.js`;
        return this.awsS3Service.putObject({
            Bucket: this.awsS3Service.defaultBucketName,
            Key: `${key}`,
            ContentType: S3ObjectContentType.JAVASCRIPT,
            ACL: S3_ACLS.PUBLIC_READ,
            Body: rawData,
        });
    }
}
