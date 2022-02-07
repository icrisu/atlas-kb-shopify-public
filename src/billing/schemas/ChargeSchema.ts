import * as mongoose from 'mongoose';

export const BILLING_STATUS = {
    PENDING_APPROVAL: 'PENDING_APPROVAL', ACCEPTED: 'ACCEPTED', ACTIVE: 'ACTIVE',
};

export const ChargeSchema = new mongoose.Schema({
    charge_id: { type: String },
    shopId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    status: { type: String, enum: [BILLING_STATUS.PENDING_APPROVAL,
        BILLING_STATUS.ACCEPTED, BILLING_STATUS.ACTIVE], default: BILLING_STATUS.PENDING_APPROVAL },
    key: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    confirmation_url: { type: String },
    trial_days: { type: Number },
});
