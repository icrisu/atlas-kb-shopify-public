import { Controller, Get, Render, UseGuards, Req, Res, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AppProxyGuard } from '../shared/guards/app.proxy.guard';
import { CustomRequest } from '../shared/interfaces/CustomRequest';
import { Response } from 'express';
import { ConfigurationService } from '../shared/configuration/configuration.service';
import { CategoryService } from '../category/category.service';
import { Configuration } from '../shared/configuration/configuration.enum';
import { ArticleService } from '../article/article.service';
import { ShopService } from '../shop/shop.service';
import * as _ from 'lodash';
import * as safe from 'undefsafe';

@Controller('storefront-api')
export class StorefrontAPIController {
    constructor(private readonly configService: ConfigurationService,
        private readonly categoryService: CategoryService,
        private readonly articleService: ArticleService, private readonly shopService: ShopService) {}

        @Get('categories/:catSlug')
        async getCategory(@Req() req: CustomRequest, @Res() res: Response, @Param('catSlug') catSlug: string): Promise<any> {
            this._setContentType(res);
            const categories = await this.categoryService.getCategoriesFront({
                shopId: req.shopData._id, status: 'published', slug: catSlug,
            }, true);
            const { locales, settings } = req.shopData;
            const result: any = this._normalizeCategories(categories, locales, false);
            try {
                this.categoryService.incrementViews(safe(categories, '0._id'));
            } catch (err) {
                // console.log(err);
            }
            res.json({
                data: {
                    category: result,
                    shop: {
                        locales: {
                            launcherTitle: safe(locales, 'launcherTitle', ''),
                            launcherAllCollections: safe(locales, 'launcherAllCollections', ''),
                            categoriesNotFound: safe(locales, 'categoriesNotFound', '')
                        },
                        settings,
                    },
                },
                status: 'OK'
            });
        }

        @Get('articles/:articleSlug')
        async getArticle(@Req() req: CustomRequest, @Res() res: Response, @Param('articleSlug') articleSlug: string): Promise<any> {
            this._setContentType(res);
            let article = await this.articleService.getArticleAndCategory(req.shopData._id, articleSlug);
            article = safe(article, 'category.status') === 'published' ? article : null;
            const category: any = _.pick(article, ['category.title', 'category.slug']);
            const { locales, settings } = req.shopData;
            try {
                this.articleService.incrementViews(article._id);
            } catch (err) {
                console.log('Can not set article viewed')
            }
            res.json({
                data: {
                    article: { ..._.pick(article, ['content', 'title', 'slug']), ...category },
                    shop: {
                        locales: {
                            launcherTitle: safe(locales, 'launcherTitle', ''),
                            launcherAllCollections: safe(locales, 'launcherAllCollections', ''),
                            categoriesNotFound: safe(locales, 'categoriesNotFound', '')
                        },
                        settings,
                    },
                },
                status: 'OK'
            });
        }
        
        @Get('categories')
        async getCategories(@Req() req: CustomRequest, @Res() res: Response): Promise<any> {
            this._setContentType(res);

            const categories = await this.categoryService.getCategoriesFront({ shopId: req.shopData._id, status: 'published' });
            const { locales, settings } = req.shopData;
            const result: any = this._normalizeCategories(categories, locales);
            res.json({
                data: {
                    shop: {
                        locales: {
                            launcherTitle: safe(locales, 'launcherTitle', ''),
                            launcherAllCollections: safe(locales, 'launcherAllCollections', ''),
                            categoriesNotFound: safe(locales, 'categoriesNotFound', '')
                        },
                        settings,
                    },
                    categories: result
                },
                status: 'OK'
            });
        }

        private _extractArticles(cat: any): any[] {
            if (_.isArray(safe(cat, 'articles'))) {
                return cat.articles.filter(article => {
                    if (!_.isNil(safe(article, 'status')) && safe(article, 'status') !== 'unpublished') {
                        return article;
                    }
                    return false;
                });
            }
            return [];
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

        private _setContentType(res: Response) {
            res.set('Content-Type', 'application/json');
        }
}