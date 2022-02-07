import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/base.service';
import { Category } from './interfaces/Category';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CategoryService extends BaseService<Category> {
    constructor(@InjectModel('Category') private readonly categoryModel: Model<Category>) {
        super();
        this.model = categoryModel;
    }

    createCategory(data: any, shopId: any, shop: string) {
        const { title, slug, shortDescription, icon, position, customIcon } = data;
        const payload = {
            shopId, shop, title, slug, shortDescription, icon, slugMatchesTitle: false, position, customIcon,
        };
        const category: Category = new this.model({...payload});
        return this.create(category);
    }

    retriveCategoriesWithPagination(filter: any, page: number, perPage: number) {
        return this.model.find(filter)
        .sort({ position: -1})
        .skip(perPage * (page - 1))
        .limit(perPage);
    }

    count(filter: any) {
        return this.model.countDocuments(filter);
    }

    async getCategoriesFront(filter: any, extraArticleInfo: boolean = false): Promise<any> {
        /* tslint:disable */
        let pushObject: any = {
            "_id": "$articles._id",
            "status": "$articles.status",
        };
        if (extraArticleInfo) {
            pushObject.shortDescription = '$articles.shortDescription';
            pushObject.title = '$articles.title';
            pushObject.slug = '$articles.slug';
        }
        return await this.model.aggregate(
            [
                { $match : filter},
                { $lookup: {
                    from: 'articles',
                    localField: '_id',
                    foreignField: 'category',
                    as: "articles",
                }},
                {
                    $unwind: { path: "$articles", preserveNullAndEmptyArrays: true },
                },
                {
                    $sort: { "articles.position": -1 },
                },
                {
                    $group: {
                        _id: "$_id",
                        title : { $first: '$title' },
                        shortDescription: { $first: '$shortDescription' },
                        slug: { $first: '$slug' },
                        icon: { $first: '$icon' },
                        position: { $first: '$position' },
                        categoryColor: { $first: '$categoryColor' },
                        customIcon: { $first: '$customIcon' },
                        articles: {
                            $push: pushObject,
                        }
                    }
                },
                { $sort : { position : -1 }},
            ]
        );
        /* tslint:enable */
    }

    incrementViews(categoryId: any): any {
        return this.model.collection.updateOne({ _id: categoryId }, { $inc: { views: 1 }});
    }
}
