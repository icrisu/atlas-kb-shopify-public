import { Injectable } from '@nestjs/common';
import { Model, Document, Types } from 'mongoose';

@Injectable()
export abstract class BaseService<T extends Document> {
    protected model: Model<T>;

    public get modelName(): string {
        return this.model.name;
    }

    exclude<K>(source: Partial<K>): Partial<K> {
        // TBD
        return {};
    }

    async findAll(filter: any = {}): Promise<T[]> {
        return this.model.find(filter).exec();
    }

    async findOne(filter: any): Promise<T> {
        return this.model.findOne(filter).exec();
    }

    async findOneWithSelect(filter: any, select: string): Promise<T> {
        return this.model.findOne(filter).select(select).exec();
    }

    async findAllWithSelect(filter: any, select: string): Promise<T[]> {
        return this.model.find(filter).select(select).exec();
    }

    async findById(id: string): Promise<T> {
        return this.model.findById(this.toObjectId(id)).exec();
    }

    async create(item: T): Promise<T> {
        return this.model.create(item);
    }

    async updateOne(filter: any, payload: any, options: any = { new: true }): Promise<T> {
        return this.model.updateOne(filter, { $set: payload }, options);
    }

    async updateMany(filter: any, payload: any, options: any = { new: true }): Promise<T> {
        return this.model.updateMany(filter, { $set: payload }, options);
    }

    async delete(id: string): Promise<T> {
        return this.model.findByIdAndRemove(this.toObjectId(id)).exec();
    }

    async deleteMany(filter: any) {
        return this.model.deleteMany(filter).exec();
    }

    async deleteOne(filter: any): Promise<T> {
        return this.model.deleteOne(filter).exec();
    }

    public toObjectId(id: string): Types.ObjectId {
        return Types.ObjectId(id);
    }

    public objectIdToString(id: any): string {
        return Types.ObjectId(id).toString();
    }
}
