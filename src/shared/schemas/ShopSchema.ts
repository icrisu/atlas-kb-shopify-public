import * as mongoose from 'mongoose';

export const ShopSchema = new mongoose.Schema({
    shop: { type: String, required: true, index: true },
    accessToken: { type: String, required: true },
    email: { type: String },
    firstChargeTrialPlacedAt: { type: Date },
    firstInstallAt: { type: Date, default: Date.now },
    shopMaxStorage: { type: Number, default: 400 }, // MB
    currentShopStorage: { type: Number, default: 0 },
    awsFolder: { type: String, required: true },
    shopMeta: { type: Object },
    impersonateToken: { type: String },
    charge: { type: mongoose.Schema.Types.ObjectId, ref: 'Charge' },
    limits: { type: Object },
    locales: { type: Object },
    settings: { type: Object },
    perks: { type: String },
    reviewInvitationSent: { type: Boolean, default: false }
});
