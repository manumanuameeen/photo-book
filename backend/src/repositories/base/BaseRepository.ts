import type { Model, Document } from "mongoose";

export abstract class BaseRepository<T extends Document> {
  protected readonly _model: Model<T>;

  constructor(model: Model<T>) {
    this._model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this._model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return await this._model.findById(id).exec();
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    const data = await this._model.findOne(query as any).exec();
    return data;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
