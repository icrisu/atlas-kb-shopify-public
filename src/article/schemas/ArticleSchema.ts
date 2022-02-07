import * as mongoose from 'mongoose';

export const STATUS = {
    PUBLISHED: 'published', UNPUBLISHED: 'unpublished',
};

export const ArticleSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    shop: { type: String, required: true, index: true },
    status: { type: String, enum: [STATUS.PUBLISHED,
        STATUS.UNPUBLISHED], default: STATUS.UNPUBLISHED },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String, default: '' },
    slugMatchesTitle: { type: Boolean, default: false },
    position: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    shortDescription: { type: String, default: '' },
    views: { type: Number, default: 0 },
    disappointed: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    happy: { type: Number, default: 0 },
});

ArticleSchema.index({
        title: 'text',
        shortDescription: 'text',
    },
    {
    weights: {
        name: 5,
        description: 2,
    },
});
