import { Document } from 'mongoose';

export interface App extends Document {
    readonly status: string;
}
