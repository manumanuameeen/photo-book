import mongoose, { Model, Document } from "mongoose";
import { IBaseRepository } from "../../interfaces/repositories/IBaseRepository";

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
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

  async findOne(query: mongoose.FilterQuery<T>): Promise<T | null> {
    const data = await this._model.findOne(query).exec();
    return data;
  }

  async update(id: string, data: mongoose.UpdateQuery<T>): Promise<T | null> {
    return await this._model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this._model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async toggleLike(id: string, userId: string): Promise<T | null> {
    const doc = await this._model.findById(id);
    if (!doc) return null;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const docData = doc as unknown as { likes: mongoose.Types.ObjectId[] };
    if (!Array.isArray(docData.likes)) {
      docData.likes = [];
    }

    const likes = docData.likes;
    const index = likes.findIndex((likeId) => likeId.toString() === userId.toString());

    if (index === -1) {
      likes.push(userObjectId);
    } else {
      likes.splice(index, 1);
    }

    return await doc.save();
  }
}
