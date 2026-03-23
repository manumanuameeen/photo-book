import { IBaseRepository } from "./IBaseRepository";
import { IHelpContent } from "../../models/helpContent.model";

export interface IHelpRepository extends IBaseRepository<IHelpContent> {
  getAll(): Promise<IHelpContent[]>;
  getByCategory(category: string): Promise<IHelpContent | null>;
  reorder(id: string, newOrder: number): Promise<IHelpContent | null>;
}
