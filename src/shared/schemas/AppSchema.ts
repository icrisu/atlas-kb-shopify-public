import * as mongoose from 'mongoose';

export const AppSchema = new mongoose.Schema({
    status: { type: String, default: 'OK' },
});
