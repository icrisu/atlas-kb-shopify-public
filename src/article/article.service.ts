
import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { Article } from './interfaces/Article';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ArticleService extends BaseService<Article> {
    constructor(@InjectModel('Article') private readonly categoryModel: Model<Article>) {
        super();
        this.model = categoryModel;
    }

    createArticle(data: any, shopId: any, shop: string) {
        const { title, slug, content, position, category, shortDescription } = data;
        const payload: any = {
            shopId, shop, title, slug, content, slugMatchesTitle: false, position, category, shortDescription,
        };
        const article: Article = new this.model({...payload});
        return this.create(article);
    }

    cloneArticle(data: any, shopId: any, shop: string) {
        const { title, slug, content, position, category, shortDescription } = data;
        const payload: any = {
            shopId, shop, title, slug, content, slugMatchesTitle: false, position, category, shortDescription,
        };
        const article: Article = new this.model({...payload});
        return this.create(article);
    }

    retriveArticlesWithPagination(filter: any, page: number, perPage: number) {
        return this.model.find(filter)
        .select('_id position title status position views disappointed neutral happy')
        .sort({ position: -1})
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec();
    }

    count(filter: any) {
        return this.model.countDocuments(filter);
    }

    async getArticleAndCategory(shopId: any, articleSlug: string): Promise<any> {
        return this.model.findOne({ shopId, slug: articleSlug, status: 'published' })
        .populate('category');
    }

    incrementViews(articleId: any): any {
        return this.model.collection.updateOne({ _id: articleId }, { $inc: { views: 1 }});
    }

    changeRating(articleId: any, rating: string, decrement: boolean = false): any {
        return this.model.collection.updateOne({ _id: this.toObjectId(articleId) }, { $inc: { [rating]: decrement ? -1 : 1 }});
    }

    async getArticlesByIds(ids: any[]): Promise<any> {
        const obj_ids: any[] = ids.map((id: any) =>  { return this.toObjectId(id); });
        return this.model.find({_id: {$in: obj_ids}, status: 'published'});
    }

    // search(searchTerm: string) {
    //     return this.model.find({ status: 'published', $text: {
    //         $search: searchTerm,
    //         $caseSensitive: false,
    //         $diacriticSensitive: true,
    //     }}, { score : { $meta: 'textScore' }})
    //     .sort( { date: 1, score: { $meta: 'textScore' }});
    // }

    async searchAdvanced(searchTerm: string, shopId: any): Promise<any> {
        /* tslint:disable */
        return this.model.aggregate([
            {
                $match: {
                    shopId: shopId,
                    status: 'published',
                    $text: { $search: searchTerm, $caseSensitive: false, $diacriticSensitive: false }
                },
            },
            {
                $sort: { score: { $meta: "textScore" } }
            },
            { $project: { _id: 1 }},
            // { $project: { _id: 1, title: 1, slug: 1, shortDescription: 1, category: 1 }},
        ]);
        /* tslint:enable */
    }

    async getPopularArticles(shopId: any) {
        return this.model.find({ shopId, status: 'published' }).sort({ views: -1 }).select('_id').limit(5);
    }

    async getWithCategories(articleIds: any[]): Promise<any> {
        /* tslint:disable */
        return this.model.aggregate([
            {
                $match: {
                    _id: { $in: articleIds }
                },
            },
            { $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: "categories",
            }},
            {
                $unwind: { path: "$categories", preserveNullAndEmptyArrays: true },
            },
            {
                $group: {
                    _id: "$_id",
                    title : { $first: '$title' },
                    shortDescription: { $first: '$shortDescription' },
                    slug: { $first: '$slug' },
                    views: { $first: '$views' },
                    // categorySlug: "$categories.slug",
                    categories: {
                        $push: {
                            slug: "$categories.slug",
                            status: "$categories.status"
                        },
                    }
                }
            },
        ]);
        /* tslint:enable */
    }
}
