import { IBaseRepository } from "./IBaseRepository.ts";
import { IHelpContent } from "../../model/helpContentModel.ts";

export interface IHelpRepository extends IBaseRepository<IHelpContent> {
    getAll(): Promise<IHelpContent[]>;
    getByCategory(category: string): Promise<IHelpContent | null>;
    reorder(id: string, newOrder: number): Promise<IHelpContent | null>;
}
