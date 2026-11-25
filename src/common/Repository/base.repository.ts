import mongoose, { AnyKeys, CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryFilter, QueryOptions, QueryWithHelpers, UpdateQuery, UpdateWithAggregationPipeline, UpdateWriteOpResult } from "mongoose";
import { IPaginate } from './../interface/IPaginate.interface';

export abstract class DatabaseRepo<TRawDocument> {
    constructor(protected model: Model<TRawDocument>) { }
    // CREATE
    async create({ data }: { data: AnyKeys<TRawDocument>; }): Promise<HydratedDocument<TRawDocument>>;
    async create({ data, options }: { data: AnyKeys<TRawDocument>[], options?: CreateOptions; }): Promise<HydratedDocument<TRawDocument>[]>;
    async create({ data, options }: { data: AnyKeys<TRawDocument> | AnyKeys<TRawDocument>[], options?: CreateOptions; }): Promise<HydratedDocument<TRawDocument> | HydratedDocument<TRawDocument>[]> {
        return await this.model.create(data as any, options);
    }
    async createOne({ data, options = {} }: { data: AnyKeys<TRawDocument>, options?: CreateOptions; }): Promise<HydratedDocument<TRawDocument>> {
        const [doc] = await this.create({ data: [data], options });
        return doc as HydratedDocument<TRawDocument>;
    }

    // FINDERS
    async findOne({ filter, projection, options }: {
        filter: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean?: false; } | null | undefined;
    }): Promise<HydratedDocument<TRawDocument> | null | undefined>;


    async findOne({ filter, projection, options }: {
        filter: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean: true; } | null | undefined;
    }): Promise<FlattenMaps<TRawDocument> | null | undefined>;


    async findOne({ filter = {}, projection, options }: {
        filter: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean?: boolean; } | null | undefined;
    }): Promise<HydratedDocument<TRawDocument> | FlattenMaps<TRawDocument> | null | undefined> {
        const doc = this.model.findOne(filter, projection);

        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        if (options?.lean) {
            doc.lean(options.populate as PopulateOptions[]);
        }
        return await doc.exec();

    }

    // FIND BY ID 
    async findByID({ id, projection, options }: {
        id: mongoose.Types.ObjectId,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean?: false; } | null | undefined;
    }): Promise<HydratedDocument<TRawDocument> | null | undefined>;


    async findByID({ id, projection, options }: {
        id: mongoose.Types.ObjectId,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean: true; } | null | undefined;
    }): Promise<FlattenMaps<TRawDocument> | null | undefined>;


    async findByID({ id, projection, options }: {
        id: mongoose.Types.ObjectId,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> & { lean?: boolean; } | null | undefined;
    }): Promise<HydratedDocument<TRawDocument> | FlattenMaps<TRawDocument> | null | undefined> {
        const doc = this.model.findById(id, projection);

        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();

    }

    // FIND

    async find({ filter = {}, options = {}, projection = {} }: {
        filter?: QueryFilter<TRawDocument>,
        projection?: ProjectionType<TRawDocument> | null | undefined,
        options?: QueryOptions<TRawDocument> | null | undefined;
    }): Promise<HydratedDocument<TRawDocument>[]> {
        const doc = this.model.find(filter);
        if (options?.select) {
            doc.select(options.select);
        }
        if (options?.sort) {
            doc.sort(options.sort);
        }
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        if (options?.skip) {
            doc.skip(options.skip);
        }
        if (options?.limit) {
            doc.limit(options.limit);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }

        return await doc.exec();

    }

    async countDocument({ filter = {} }: { filter?: QueryFilter<TRawDocument>; }): Promise<number> {
        return await this.model.countDocuments(filter);
    }


    async paginate({ filter = {}, options = {}, page = 1, limit = 5 }: { filter: QueryFilter<TRawDocument>, options: QueryOptions<TRawDocument>, page: number, limit: number; }): Promise<IPaginate<HydratedDocument<TRawDocument>>> {
        const skip = (page - 1) * limit;
        const count = await this.countDocument({ filter });
        const pages = Math.ceil(count / limit);
        const docs = await this.find({
            filter, options: {
                skip,
                limit,
                ...options
            }
        });

        return { count, limit, pages, currentPage: page, docs };
    }
    // UPDATE
    // UPDATEONE
    async updateOne({ filter, update, options }: {
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,
        options?: (MongooseUpdateQueryOptions<TRawDocument>) | null;
    }): Promise<UpdateWriteOpResult> {
        return await this.model.updateOne(filter, update, options);
    }

    // UPDATE MANY
    async updateMany({ filter, update, options }: {
        filter: QueryFilter<TRawDocument>,
        update: UpdateQuery<TRawDocument> | UpdateWithAggregationPipeline,
        options?: (MongooseUpdateQueryOptions<TRawDocument>) | null;
    }): Promise<UpdateWriteOpResult> {
        return await this.model.updateMany(filter, update, options);
    }

    //findOneAndUpdate
    async findOneAndUpdate({ filter, update, options }: {
        filter?: QueryFilter<TRawDocument>,
        update?: UpdateQuery<TRawDocument>,
        options?: QueryOptions<TRawDocument> | null;
    }): Promise<HydratedDocument<TRawDocument> | null> {
        return await this.model.findOneAndUpdate(filter, update, { returnDocument: 'after', ...options });
    }

    //findByIdAndUpdate
    async findByIdAndUpdate({ id, update, options }: {
        id?: mongoose.Types.ObjectId | any,
        update?: UpdateQuery<TRawDocument>,
        options?: QueryOptions<TRawDocument> | null;
    }): Promise<HydratedDocument<TRawDocument> | null> {
        return await this.model.findByIdAndUpdate(id, update, { returnDocument: 'after', ...options });
    }



    // DELETE
    // DELETEONE
    async deleteOne({ filter }: {
        filter: QueryFilter<TRawDocument>,

    }): Promise<DeleteResult> {
        return await this.model.deleteOne(filter);
    }

    // delete MANY
    async deleteMany({ filter }: {
        filter: QueryFilter<TRawDocument>,
    }): Promise<DeleteResult> {
        return await this.model.deleteMany(filter);
    }

    //findOneAndDelete
    async findOneAndDelete({ filter }: {
        filter?: QueryFilter<TRawDocument>,

    }): Promise<HydratedDocument<TRawDocument> | null> {
        return await this.model.findOneAndDelete(filter);
    }

    //findByIdAndUpdate
    async findByIdAndDelete({ id }: {
        id?: mongoose.Types.ObjectId | any,
    }): Promise<HydratedDocument<TRawDocument> | null> {
        return await this.model.findByIdAndDelete(id);
    }
} 
