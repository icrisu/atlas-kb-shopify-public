import * as mongoose from 'mongoose';

export const AssetSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    shop: { type: String, required: true, index: true },
    url: { type: String, required: true },
    Key: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    size: { type: Number, default: 0 },
});
