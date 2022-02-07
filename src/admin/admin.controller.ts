import { Controller, Get, Req, UseGuards, Post, Body, HttpException, HttpStatus, Query, Param, Delete, Put } from '@nestjs/common';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { ShopService } from '../shop/shop.service';
import { ValidateAdminSignature } from '../shared/guards/validate.admin.signature.guard';
import { CustomRequest } from '../shared/interfaces/CustomRequest';
import { AdminShopData } from './dto/AdminShopData';
import { AdminService } from './admin.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { Configuration } from '../shared/configuration/configuration.enum';
import { CategoryService } from '../category/category.service';
import * as _ from 'lodash';
import * as safe from 'undefsafe';
import { ArticleService } from '../article/article.service';
import { StorefrontAssetsService } from '../storefront-assets/storefront-assets.service';
import * as uuidv1 from 'uuid/v1';
import * as shortid from 'shortid';

const localesExplained: any = {
    title: `Page main title`,
    searchPlaceholder: `Search placeholder`,
    catOneArticle: `One article found in category`,
    catMultipleArticls: `Multiple articles found in category`,
    catNoArticles: `0 articles found in category`,
    categoriesNotFound: `Categories not found`,
    categoryNotFound: `Category not found`,
    articleNotFound: `Article not found`,
    navAllCategories: `Nav all categories`,
    ratingQuestion: `Rating question`,
    searchResultTitle: `Search results`,
    invalidSearchTerm: `Invalid search term`,
    resultsNotFound: `No search results found`,
    searchResultNavLabel: `Search results nav label`,
    articleReadMore: `Read more (article)`,
    recentlyViewed: `Recently viewed widget title`,
    popularArticle: `Popular articles widget title`,
    launcherTitle: `Atlas launcher title`,
    launcherAllCollections: `All collection, showing within Atlas launcher navigation`
};

@Controller('api-admin')
@UseGuards(ValidateAdminSignature)
export class AdminController {

    constructor(private readonly configService: ConfigurationService,
        private readonly shopService: ShopService,
        private readonly adminService: AdminService,
        private readonly emailService: EmailService,
        private readonly notificationService: NotificationsService,
        private readonly categoryService: CategoryService,
        private readonly articleService: ArticleService,
        private readonly storefrontAssetsService: StorefrontAssetsService) {}

    @Get('translation')
    getTranslation(): any {
        return this.adminService.getTranslation();
    }

    @Get('shop')
    getShop(@Req() req: CustomRequest): AdminShopData {
        return {
            _id: req.shopData._id,
            shop: req.shopData.shop,
            name: req.shopData.shopMeta.name,
            email: req.shopData.shopMeta.email,
            domain: req.shopData.shopMeta.domain,
            requiresCharge: req.shopData.requiresCharge,
            hasActiveCharge: req.shopData.hasActiveCharge,
            placeChargeUrl: req.shopData.placeChargeUrl,
            appNamePretty: this.configService.get(Configuration.APP_NAME_PRETTY),
            appInternalKey: this.configService.get(Configuration.APP_INTERNAL_KEY),
            appMarketplaceUrl: this.configService.get(Configuration.APP_APSTORE_URL),
            documentationUrl: `${this.configService.getAppBaseProxyUrl()}/documentation`,
            locales: req.shopData.locales,
            settings: req.shopData.settings,
            localesExplained,
        };
    }

    @Post('get-support')
    async requestSupport(@Body() body): Promise<any> {
        try {
            await this.emailService.sendSupportEmail(body.email, body.message, body.name);
            try {
                const slackMessage: string = `Support: ${body.email} - ${body.name} - ${body.message}`;
                this.notificationService.sendSlackNotification(slackMessage, 'app-support');
            } catch (err) {
                // do nothing
            }
            return { status: 'OK' };
        } catch (err) {
            throw new HttpException(err, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('app-tutorials')
    getAppTutorials(): any {
        return this.adminService.getAppTutorials();
    }

    @Get('other-apps')
    async getOtherApps(): Promise<any> {
        return await this.adminService.getOtherApps();
    }

    @Post('create-category')
    async createCategory(@Body() body, @Req() req: CustomRequest): Promise<any> {
        const category: any = await this.categoryService.findOne({ slug: body.slug, shopId: req.shopData._id });
        if (!_.isNil(category)) {
            throw new HttpException({ status: 'FAIL', message: 'Slug already exists!' }, HttpStatus.CONFLICT);
        }
        const { _id, shop } = req.shopData;
        const categories: any[] = await this.categoryService.findAll({ shop });
        const { maxCategories } = req.shopData.limits;
        if (categories.length > maxCategories) {
            const erMessage: string = 'Category max limit reached! Contact us to lift this restriction!';
            throw new HttpException({ status: 'FAIL', message: erMessage }, HttpStatus.CONFLICT);
        }
        body.position = categories.length + 1;
        const categoryCreated: any = await this.categoryService.createCategory(body, _id, shop);
        return {
            status: 'OK', category: categoryCreated,
        };
    }

    @Get('categories')
    async getCategoriesWithPagination(@Req() req: CustomRequest, @Query('page') page: number): Promise<any> {
        const { shop } = req.shopData;
        const perPage: number = this.configService.get(Configuration.MAX_CATEGORIES_PAGE);
        const items: any = await this.categoryService.retriveCategoriesWithPagination({ shop }, page, perPage);
        const totalItems: number = await this.categoryService.count({ shop });
        return { status: 'OK', categories: {
            items,
            totalPages: Math.ceil(totalItems / perPage),
            currentPage: Number(page),
        }};
    }

    @Get('categories-all')
    async getAllCategories(@Req() req: CustomRequest): Promise<any> {
        const { shop } = req.shopData;
        const categories: any[] = await this.categoryService.findAllWithSelect({ shop }, '_id title');
        return { status: 'OK', categories };
    }

    @Get('categories/:id')
    async getCategory(@Param('id') _id: any, @Req() req: CustomRequest): Promise<any> {
        const { shop } = req.shopData;
        const category: any = await this.categoryService.findOne({ shop, _id });
        return { status: 'OK', category};
    }

    @Get('categories/:id/status/:publishStatus')
    async changeCategoryStatus(@Param('id') _id: any, @Param('publishStatus') publishStatus: any, @Req() req: CustomRequest): Promise<any> {
        const { shop } = req.shopData;
        const status: string = String(publishStatus) === '1' ? 'published' : 'unpublished';
        const category: any = await this.categoryService.updateOne({ _id, shop }, { status });
        return { status: 'OK', category };
    }

    @Put('categories/:id')
    async updateCategory(@Param('id') _id: any, @Body() body: any, @Req() req: CustomRequest): Promise<any> {
        const category: any = await this.categoryService.findOne({ slug: body.slug, shopId: req.shopData._id });
        if (!_.isNil(category) && String(safe(category, '_id')) !== _id) {
            throw new HttpException({ status: 'FAIL', message: 'Slug already exists!' }, HttpStatus.CONFLICT);
        }
        const { shop } = req.shopData;
        const { shortDescription, title, position, slug, icon, customIcon, categoryColor } = body;
        const result: any = await this.categoryService.updateOne({ shop, _id }, {
            shortDescription, title, position, slug, icon, customIcon, categoryColor, updatedAt: Date.now(),
        });
        return { status: 'OK', category: result };
    }

    @Delete('categories/:id')
    async deleteCategory(@Param('id') _id: any, @Req() req: CustomRequest) {
        const { shop } = req.shopData;
        const category: any = await this.categoryService.deleteOne({ _id, shop });
        await this.articleService.updateMany({ shopId: req.shopData._id, category: _id }, { category: null });
        return { status: 'OK', category };
    }

    @Post('create-article')
    async createArticle(@Body() body, @Req() req: CustomRequest): Promise<any> {

        const article: any = await this.articleService.findOne({ slug: body.slug, shopId: req.shopData._id });
        if (!_.isNil(article)) {
            throw new HttpException({ status: 'FAIL', message: 'Slug already exists!' }, HttpStatus.CONFLICT);
        }
        const { _id, shop } = req.shopData;
        const articles: any[] = await this.articleService.findAll({ shop });
        const { maxArticles } = req.shopData.limits;
        if (articles.length > maxArticles) {
            const erMessage: string = 'Articles max limit reached! Contact us to lift this restriction!';
            throw new HttpException({ status: 'FAIL', message: erMessage }, HttpStatus.CONFLICT);
        }
        body.position = articles.length + 1;
        const articlesCreated: any = await this.articleService.createArticle(body, _id, shop);
        return {
            status: 'OK', article: articlesCreated,
        };
    }

    @Post('clone-article/:id')
    async cloneArticle(@Param('id') articleId: any, @Req() req: CustomRequest): Promise<any> {
        const article: any = await this.articleService.findOne({
            _id: this.articleService.toObjectId(articleId), shopId: req.shopData._id,
        });
        if (_.isNil(article)) {
            throw new HttpException({ status: 'FAIL', message: `Original article not found!` }, HttpStatus.CONFLICT);
        }
        const { _id, shop } = req.shopData;
        const articles: any[] = await this.articleService.findAll({ shop });
        const { maxArticles } = req.shopData.limits;
        if (articles.length > maxArticles) {
            const erMessage: string = 'Articles max limit reached! Contact us to lift this restriction!';
            throw new HttpException({ status: 'FAIL', message: erMessage }, HttpStatus.CONFLICT);
        }
        const nextPosition: number = articles.length + 1;
        const { content, category, shortDescription } = article;
        let { title, slug } = article;
        const uid = shortid();
        title += ` Clone - ${uid}`;
        slug += `-${uid}`;
        const articleCreated: any = await this.articleService.cloneArticle({
            title, slug, content, category, shortDescription, position: nextPosition,
        }, _id, shop);
        return {
            status: 'OK', article: articleCreated,
        };
    }

    @Put('articles/:id')
    async updateArticle(@Param('id') _id: any, @Body() body: any, @Req() req: CustomRequest): Promise<any> {
        const article: any = await this.articleService.findOne({ slug: body.slug, shopId: req.shopData._id });
        if (!_.isNil(article) && String(safe(article, '_id')) !== _id) {
            throw new HttpException({ status: 'FAIL', message: 'Slug already exists!' }, HttpStatus.CONFLICT);
        }
        const { shop } = req.shopData;
        const { title, slug, content, position, category, shortDescription } = body;
        const result: any = await this.articleService.updateOne({ shop, _id }, {
            title, slug, content, position, category, updatedAt: Date.now(), shortDescription,
        });
        return { status: 'OK', article: result };
    }

    @Get('articles/:id')
    async getArticle(@Param('id') _id: any, @Req() req: CustomRequest): Promise<any> {
        const { shop } = req.shopData;
        const article: any = await this.articleService.findOne({ shop, _id });
        return { status: 'OK', article};
    }

    @Get('articles/:id/status/:publishStatus')
    async changeArticleStatus(@Param('id') _id: any, @Param('publishStatus') publishStatus: any, @Req() req: CustomRequest): Promise<any> {
        const { shop } = req.shopData;
        const status: string = String(publishStatus) === '1' ? 'published' : 'unpublished';
        const article: any = await this.articleService.updateOne({ _id, shop }, { status });
        return { status: 'OK', article };
    }

    @Delete('articles/:id')
    async deleteArticle(@Param('id') _id: any, @Req() req: CustomRequest) {
        const { shop } = req.shopData;
        const article: any = await this.articleService.deleteOne({ _id, shop });
        return { status: 'OK', article };
    }

    @Get('articles')
    async getArticlesWithPagination(@Req() req: CustomRequest, @Query('page') page: number): Promise<any> {
        const { shop } = req.shopData;
        const perPage: number = this.configService.get(Configuration.MAX_ARTICLES_PAGE);
        const items: any = await this.articleService.retriveArticlesWithPagination({ shop }, page, perPage);
        const totalItems: number = await this.articleService.count({ shop });
        return { status: 'OK', articles: {
            items,
            totalPages: Math.ceil(totalItems / perPage),
            currentPage: Number(page),
        }};
    }

    @Post('upload-media')
    async uploadFile(@Req() req: CustomRequest, @Body() body): Promise<any> {
        if (_.isNil(safe(req, 'files.file.data')) && !_.isNumber(safe(req, 'files.file.size'))) {
            throw new HttpException({ status: 'FAIL', message: 'Invalid file!' }, HttpStatus.FORBIDDEN);
        }
        const key: string = `${req.shopData.awsFolder}/${uuidv1()}.png`;
        const existingStorage: any = await this.storefrontAssetsService.getTotalFilesSize(req.shopData._id);
        if (safe(existingStorage, '0.totalSize') > req.shopData.limits.maxStorageSpace) {
            throw new HttpException({
                status: 'FAIL',
                message: `Max file storage has been exceeded, contact support to lift the limit.` },
                HttpStatus.EXPECTATION_FAILED);
        }

        try {
            const result = await this.storefrontAssetsService.uploadPhoto(key, req.files.file.data);
            const { shop } = req.shopData;
            const { Key, url } = result;
            await this.storefrontAssetsService.saveAssetToDB(shop, req.shopData._id, {url, Key, size: req.files.file.size});
            return { status: 'OK', url };
        } catch (err) {
            throw new HttpException({ status: 'FAIL', message: 'Something went wrong' }, HttpStatus.EXPECTATION_FAILED);
        }
    }

    @Put('settings')
    async updateSettings(@Body() body: any, @Req() req: CustomRequest): Promise<any> {
        const { locales, settings } = body;
        this.storefrontAssetsService.handleStorefrontScriptTag(req.shopData, settings);
        await this.shopService.updateOne({ _id: req.shopData._id }, { locales, settings });
        return { status: 'OK', result: {} };
    }

    // @Get('all-articles-soft')
    // async getAllArticlesSoft(@Param('id') _id: any, @Req() req: CustomRequest): Promise<any> {
    //     const { shop } = req.shopData;
    //     const results: any = await this.articleService.findAllWithSelect({shop}, '_id');
    //     const parsedIds: any[] = results.map(article => {
    //         return article._id;
    //     });
    //     const finalResults: any[] = await this.articleService.getWithCategories(parsedIds);
    //     const articles: any[] = finalResults.map(resultF => {
    //         const o = { ...resultF, catSlug: safe(resultF, 'categories.0.slug') };
    //         delete o.categories;
    //         return o;
    //     });
    //     return { status: 'OK', articles};
    // }

    @Post('search-article')
    async search(@Req() req: CustomRequest, @Body('term') s: string): Promise<any> {
        if (_.isNil(s)) {
            s = '';
        }
        const results: any = await this.articleService.searchAdvanced(s, req.shopData._id);
        const parsedIds: any[] = results.map(article => {
            return article._id;
        });
        const finalResults: any[] = await this.articleService.getWithCategories(parsedIds);
        const articles: any[] = finalResults.map(resultF => {
            const o = { ...resultF, catSlug: safe(resultF, 'categories.0.slug') };
            delete o.categories;
            return o;
        });
        return { status: 'OK', articles };
    }
}
