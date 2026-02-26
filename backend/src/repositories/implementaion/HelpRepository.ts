import { BaseRepository } from "../base/BaseRepository.ts";
import { IHelpContent, HelpContentModel } from "../../model/helpContentModel.ts";
import { IHelpRepository } from "../../interfaces/repositories/IHelpRepository.ts";

export class HelpRepository extends BaseRepository<IHelpContent> implements IHelpRepository {
    constructor() {
        super(HelpContentModel);
    }

    async getAll(): Promise<IHelpContent[]> {
        return await this._model.find().sort({ order: 1 });
    }

    async getByCategory(category: string): Promise<IHelpContent | null> {
        return await this._model.findOne({ category });
    }

    async reorder(id: string, newOrder: number): Promise<IHelpContent | null> {
        return await this._model.findByIdAndUpdate(id, { order: newOrder }, { new: true });
    }
}
