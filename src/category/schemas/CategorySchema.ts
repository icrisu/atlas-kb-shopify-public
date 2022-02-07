import * as mongoose from 'mongoose';

export const STATUS = {
    PUBLISHED: 'published', UNPUBLISHED: 'unpublished',
};

export const CategorySchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    shop: { type: String, required: true, index: true },
    status: { type: String, enum: [STATUS.PUBLISHED,
        STATUS.UNPUBLISHED], default: STATUS.UNPUBLISHED },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    slugMatchesTitle: { type: Boolean, default: false },
    position: { type: Number },
    icon: { type: String },
    categoryColor: { type: String, default: '#818a96' },
    customIcon: { type: String },
    views: { type: Number, default: 0 },
});
