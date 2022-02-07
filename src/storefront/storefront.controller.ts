import { Controller, Get, Post, Render, Body, UseGuards, Req, Res, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AppProxyGuard } from '../shared/guards/app.proxy.guard';
import { CustomRequest } from '../shared/interfaces/CustomRequest';
import { Response } from 'express';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { CategoryService } from '../category/category.service';
import { Configuration } from '../shared/configuration/configuration.enum';
import * as _ from 'lodash';
import * as safe from 'undefsafe';
import { ArticleService } from '../article/article.service';
import { ShopService } from '../shop/shop.service';

const ratingStates: any = ['disappointed', 'neutral', 'happy'];

@Controller('knb')
export class StorefrontController {

    constructor(private readonly configService: ConfigurationService,
        private readonly categoryService: CategoryService,
        private readonly articleService: ArticleService, private readonly shopService: ShopService) {}

    @Get('set-rating')
    async setRating(@Req() req: CustomRequest, @Query('rating') rating: string,
    @Query('er') existingRating: string, @Query('id') id: any, @Res() res: Response): Promise<any> {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/javascript');

        if (!ratingStates.includes(rating)) {
            throw new HttpException({ status: 'FAIL'}, HttpStatus.EXPECTATION_FAILED);
        }

        if (_.isNil(req.session.ratings)) {
            req.session.ratings = [];
        }
        /* tslint:disable */
        const found: number = _.findIndex(req.session.ratings, (o: any) => { return o.id === id; });
        /* tslint:enable */
        if (found >= 0) {
            const ratings: any[] = [...req.session.ratings];
            if (ratings[found].rating !== rating) {
                await this.articleService.changeRating(id, rating);
                await this.articleService.changeRating(id, ratings[found].rating, true);
                req.session.ratings[found].rating = rating;
            }
        } else {
            if (_.isNil(req.session.ratings)) {
                req.session.ratings = [];
            }
            req.session.ratings.push({ id, rating });
            await this.articleService.changeRating(id, rating);
            const validExistingRating: boolean = !_.isNil(existingRating) && ratingStates.includes(existingRating);
            if (validExistingRating && existingRating !== rating && found === -1) {
                await this.articleService.changeRating(id, existingRating, true);
            }
        }
        res.send('');
    }

    @Get('get-recently')
    async setRecentViewed(@Req() req: CustomRequest, @Query('ids') ids: any,
        @Query('knbMainPath') knbMainPath: any, @Query('knbQuery') knbQuery: any,
        @Query('recentlyLabel') recentlyLabel: any, @Res() res: Response): Promise<any> {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/javascript');
        const response: any = await this._getLatestVisitedArticles(ids, knbMainPath, knbQuery, recentlyLabel);
        res.send(response);
    }

    @Get('search')
    @UseGuards(AppProxyGuard)
    async search(@Req() req: CustomRequest, @Res() res: Response, @Query() query: any,
    @Query('s') s: string): Promise<any> {
        this._setResponseContentType(res);
        if (_.isNil(s)) {
            s = '';
        }
        const results: any = await this.articleService.searchAdvanced(s, req.shopData._id);
        const parsedIds: any[] = results.map(article => {
            return article._id;
        });
        const finalResults: any[] = await this.articleService.getWithCategories(parsedIds);
        const articles: any[] = finalResults.filter(resultF => {
            const o = { ...resultF, catSlug: safe(resultF, 'categories.0.slug') };
            delete o.categories;
            return safe(resultF, 'categories.0.status') === 'published';
        });

        const lookAndFeel = _.get(req, 'shopData.settings.lookAndFeel', 'startup');
        let view: string = lookAndFeel === 'startup' ? 'startup/knb-search' : 'knb-search';

        let popularArticlesFInal: any[] = [];
        if (lookAndFeel === 'startup') {
            popularArticlesFInal = await this._getPopularArticles(req.shopData._id);
        }

        let { locales, settings } = req.shopData;
        if (!_.get(settings, 'showLauncherOnHelpPages', false)) {
            settings.customCss += `
            #atlas-launcher {
                    display: none !important;
            }
            `
        }
        return res.render(view, {
            articles,
            recentlyLabel: _.get(locales, 'recentlyViewed', ''),
            latestVisited: {},
            popularArticlesFInal,
            cssUrl: this.getCssUrl(),
            iconsCssUrl: this.getIconsCss(),
            locales,
            pathPrefix: query.path_prefix,
            settings,
            searchTerm: s,
            ajxPathPrefix: this.configService.isDevelopment ? `/knb` : `/knb`,
            pathQueryVars: this.configService.isDevelopment ? `?shop=${req.shopData.shop}` : '',
            ajxQueryVars: this.configService.isDevelopment ? `?shop=${req.shopData.shop}` : `?shop=${req.shopData.shop}`,
            apiRoot: `${this.configService.getAppBaseProxyUrl()}`,
            jsUrl: this.getJSUrl(),
            shop: _.get(req, 'shopData.shop', ''),
            _: _
        })
    }

    @Post('search-ajx')
    async searchAjx(@Req() req: CustomRequest, @Res() res: Response,
    @Query('s') s: string, @Body() body: any): Promise<any> {
        if (_.isNil(s)) {
            s = '';
        }

        const results: any = await this.articleService.searchAdvanced(_.get(body, 's', ''), req.shopData._id);
        const parsedIds: any[] = results.map(article => {
            return article._id;
        });
        const finalResults: any[] = await this.articleService.getWithCategories(parsedIds);
        const articles: any[] = finalResults.filter(resultF => {
            const o = { ...resultF, catSlug: safe(resultF, 'categories.0.slug') };
            delete o.categories;
            return safe(resultF, 'categories.0.status') === 'published';
        });

        return res.status(200).json({
            status: 'OK',
            articles
        })
    }

    @Get()
    @UseGuards(AppProxyGuard)
    // @Render('knb-categories')
    async index(@Req() req: CustomRequest, @Res() res: Response, @Query() query: any): Promise<any> {
        const categories = await this.categoryService.getCategoriesFront({ shopId: req.shopData._id, status: 'published' });
        this._setResponseContentType(res);
        const lookAndFeel = _.get(req, 'shopData.settings.lookAndFeel', 'startup');
        let { locales, settings } = req.shopData;
        let view: string = lookAndFeel === 'startup' ? 'startup/knb-categories' : 'knb-categories';
        if (!_.get(settings, 'showLauncherOnHelpPages', false)) {
            settings.customCss += `
            #atlas-launcher {
                    display: none !important;
            }
            `
        }
        return res.render(view, {
            categories: this._normalizeCategories(categories, locales),
            cssUrl: this.getCssUrl(),
            iconsCssUrl: this.getIconsCss(),
            locales,
            pathPrefix: query.path_prefix,
            pathQueryVars: this.configService.isDevelopment ? `?shop=${req.shopData.shop}` : '',
            settings,
            shop: _.get(req, 'shopData.shop', ''),
            _: _
        })
    }

    @Get(':catSlug')
    @UseGuards(AppProxyGuard)
    // @Render('knb-category')
    async getCategory(@Req() req: CustomRequest, @Res() res: Response, @Query() query: any, @Param('catSlug') catSlug: string): Promise<any> {
        const categories = await this.categoryService.getCategoriesFront({
            shopId: req.shopData._id, status: 'published', slug: catSlug,
        }, true);
        this._setResponseContentType(res);

        try {
            this.categoryService.incrementViews(safe(categories, '0._id'));
        } catch (err) {
            // console.log(err);
        }
        const lookAndFeel = _.get(req, 'shopData.settings.lookAndFeel', 'startup');
        let view: string = lookAndFeel === 'startup' ? 'startup/knb-category' : 'knb-category';
        let { locales, settings } = req.shopData;

        let popularArticlesFInal: any[] = [];
        if (lookAndFeel === 'startup') {
            popularArticlesFInal = await this._getPopularArticles(req.shopData._id);
        }

        if (!_.get(settings, 'showLauncherOnHelpPages', false)) {
            settings.customCss += `
            #atlas-launcher {
                    display: none !important;
            }
            `
        }

        return res.render(view, {
            recentlyLabel: _.get(locales, 'recentlyViewed', ''),
            latestVisited: {},
            popularArticlesFInal,
            categories: this._normalizeCategories(categories, locales, false),
            cssUrl: this.getCssUrl(),
            jsUrl: this.getJSUrl(),
            iconsCssUrl: this.getIconsCss(),
            locales,
            pathPrefix: query.path_prefix,
            settings,
            ajxPathPrefix: this.configService.isDevelopment ? `/knb` : `/knb`,
            pathQueryVars: this.configService.isDevelopment ? `?shop=${req.shopData.shop}` : '',
            ajxQueryVars: this.configService.isDevelopment ? `?shop=${req.shopData.shop}` : `?shop=${req.shopData.shop}`,
            apiRoot: `${this.configService.getAppBaseProxyUrl()}`,
            shop: _.get(req, 'shopData.shop', ''),
            _: _
        })
    }

    @Get(':catSlug/:articleSlug')
    @UseGuards(AppProxyGuard)
    async getArticle(@Req() req: CustomRequest, @Res() res: Response, @Query() query: any,
    @Param('catSlug') catSlug: string, @Param('articleSlug') articleSlug: string): Promise<any> {
        let article = await this.articleService.getArticleAndCategory(req.shopData._id, articleSlug);
        this._setResponseContentType(res);
        try {
            if (safe(article, 'category.status') === 'published') {
                this.articleService.incrementViews(article._id);
            }
        } catch (err) {
            // console.log(err);
        }
        article = safe(article, 'category.status') === 'published' ? article : null;
        let { locales, settings } = req.shopData;
        const lookAndFeel = _.get(req, 'shopData.settings.lookAndFeel', 'startup');
        let view: string = lookAndFeel === 'startup' ? 'startup/knb-article' : 'knb-article';

        let popularArticlesFInal: any[] = [];
        if (lookAndFeel === 'startup') {
            popularArticlesFInal = await this._getPopularArticles(req.shopData._id);
        }

        // this._addRecentView(req, article._id)
        if (!_.get(settings, 'showLauncherOnHelpPages', false)) {
            settings.customCss += `
            #atlas-launcher {
                    display: none !important;
            }
            `
        }

        return res.render(view, {
            article,
            recentlyLabel: _.get(locales, 'recentlyViewed', ''),
            latestVisited: {},
            popularArticlesFInal,
            cssUrl: this.getCssUrl(),
            jsUrl: this.getJSUrl(),
            iconsCssUrl: this.getIconsCss(),
            locales,
            pathPrefix: query.path_prefix,
            ajxPathPrefix: this.configService.isDevelopment ? `/knb` : `/knb`,
            pathQueryVars: this.configService.isDevelopment ? `?shop=${req.shopData.shop}` : '',
            ajxQueryVars: this.configService.isDevelopment ? `?shop=${req.shopData.shop}` : `?shop=${req.shopData.shop}`,
            apiRoot: `${this.configService.getAppBaseProxyUrl()}`,
            settings,
            shop: _.get(req, 'shopData.shop', ''),
            _: _
        })
    }

    private _setResponseContentType(res: Response): void {
        res.set('Content-Type', 'application/liquid');
        if (!this.configService.isDevelopment) {
            res.set('Content-Type', 'application/liquid');
        }
    }

    private getIconsCss(): string {
        const local: string = `${this.configService.getAppBaseProxyUrl()}/icon-fonts/style.css`;
        const aws: string = `${this.configService.get(Configuration.AWS_S3_BUCKET_URL)}/style.css`;
        return this.configService.isDevelopment ? local : aws;
    }

    private getCssUrl(): string {
        const local: string = `${this.configService.getAppBaseProxyUrl()}/storefront/index.css`;
        const aws: string = `${this.configService.get(Configuration.AWS_S3_BUCKET_URL)}/index.css`;
        return this.configService.isDevelopment ? local : aws;
    }

    private getJSUrl(): string {
        const local: string = `${this.configService.getAppBaseProxyUrl()}/storefront/index.js`;
        const aws: string = `${this.configService.get(Configuration.AWS_S3_BUCKET_URL)}/index.js`;
        return this.configService.isDevelopment ? local : aws;
    }

    private _normalizeCategories(categories: any[] = [], localesObj: any, deleteArts: boolean = true): any {
        return categories.map(cat => {
            cat.articles = this._extractArticles(cat);
            if (cat.articles.length === 0) {
                cat.articleNo = 0;
            } else {
                cat.articleNo = cat.articles.length;
            }
            if (deleteArts) {
                delete cat.articles;
            }
            let compiled: any;
            if (cat.articleNo === 0) {
                compiled = _.template(localesObj.catNoArticles);
                cat.articlesFound = compiled({ articlesNo: cat.articleNo });
            } else if (cat.articleNo === 1) {
                compiled = _.template(localesObj.catOneArticle);
                cat.articlesFound = compiled({ articlesNo: cat.articleNo });
            } else if (cat.articleNo > 1) {
                compiled = _.template(localesObj.catMultipleArticls);
                cat.articlesFound = compiled({ articlesNo: cat.articleNo });
            } else {
                cat.articlesFound = '';
            }
            return cat;
        });
    }

    private _extractArticles(cat: any): any[] {
        if (_.isArray(cat.articles)) {
            return cat.articles.filter(article => {
                if (!_.isNil(safe(article, 'status')) && safe(article, 'status') !== 'unpublished') {
                    return article;
                }
                return false;
            });
        }
        return [];
    }

    private async _getPopularArticles(shopId: any): Promise<any> {
        const popularArticlesRaw: any = await this.articleService.getPopularArticles(shopId);
        const parsedPopularIds: any[] = popularArticlesRaw.map(idObj => {
            return idObj._id;
        });
        const finalResultsPopular: any[] = await this.articleService.getWithCategories(parsedPopularIds);
        let popularArticlesFInal: any[] = [];
        popularArticlesFInal = finalResultsPopular.filter(resultF => {
            const o = { ...resultF, catSlug: safe(resultF, 'categories.0.slug') };
            delete o.categories;
            delete resultF.shortDescription;
            resultF.catSlug = safe(resultF, 'categories.0.slug');
            return safe(resultF, 'categories.0.status') === 'published';
        });
        return _.orderBy(popularArticlesFInal, ['views'], ['desc']);
    }

    private async _getLatestVisitedArticles(ids: any, knbMainPath: any, knbQuery: any, recentlyLabel: any): Promise<any> {
        let latestVisited: any[] = [];
        try {
            ids = JSON.parse(ids);
        } catch (err) {

        }
        if (_.isNil(recentlyLabel) || recentlyLabel === '') {
            return '';
        }
        if (_.isArray(ids) && ids.length > 0) {
            const parsedIds: any[] = ids.map(id => {
                return this.articleService.toObjectId(id);
            });
            const finalResults: any[] = await this.articleService.getWithCategories(parsedIds);
            latestVisited = finalResults.filter(resultF => {
                const o = { ...resultF, catSlug: safe(resultF, 'categories.0.slug') };
                delete o.categories;
                delete resultF.shortDescription;
                resultF.status = safe(resultF, 'categories.0.status');
                resultF.catSlug = safe(resultF, 'categories.0.slug');
                delete resultF.categories;
                return safe(resultF, 'status') === 'published';
            });
        }
        if (latestVisited.length === 0) {
            return '';
        }

        let links: any = '';

        latestVisited.map(article => {
            links += `
            <a class="atlas-widget-link" href="${knbMainPath}/${article.catSlug}/${article.slug}${knbQuery}">
            <span class="unf-notebook icon"></span>
            <span>${article.title}</span>
            </a>
            `;
        })
        const response: any = `
        var knbRecentWidget = \`<div class="atlas_widget atlas_widget">
        <h3 class="atlas_widget-title">${recentlyLabel}</h3>
        ${links}
        </div>\`;
document.getElementById("knb-sidebar").insertAdjacentHTML("afterbegin", knbRecentWidget);
`;

        return response;
    }

    // private async _getLatestVisited(req: any): Promise<any> {
    //     let latestVisited: any[] = [];
    //     if (_.isNil(req.session.latestVisited)) {
    //         req.session.latestVisited = [];
    //     }
    //     if (_.isArray(_.get(req, 'session.latestVisited')) && req.session.latestVisited.length > 0) {
    //         const parsedIds: any[] = req.session.latestVisited.map(id => {
    //             return this.articleService.toObjectId(id);
    //         });
    //         const finalResults: any[] = await this.articleService.getWithCategories(parsedIds);
    //         latestVisited = finalResults.filter(resultF => {
    //             const o = { ...resultF, catSlug: safe(resultF, 'categories.0.slug') };
    //             delete o.categories;
    //             delete resultF.shortDescription;
    //             resultF.catSlug = safe(resultF, 'categories.0.slug');
    //             return safe(resultF, 'categories.0.status') === 'published';
    //         });
    //     }
    //     return latestVisited.reverse();
    // }

    
    // private _addRecentView(req: any, articleId: any) {
    //     console.log('add to session 1', req.session.latestVisited);
    //     if (!_.isArray(req.session.latestVisited)) {
    //         req.session.latestVisited = [];
    //     }
    //     console.log('add to session 2', req.session.latestVisited);
    //     const stringObjectId: string = this.articleService.objectIdToString(articleId);
    //     if (req.session.latestVisited.indexOf(stringObjectId) === -1) {
    //         req.session.latestVisited.push(stringObjectId);
    //         if (req.session.latestVisited.length > 4) {
    //             const max: number = 4;
    //             // req.session.latestVisited.splice(max, req.session.latestVisited.length);
    //         }
    //     }
    //     console.log('add to session 3', req.session.latestVisited);
    // }
}
