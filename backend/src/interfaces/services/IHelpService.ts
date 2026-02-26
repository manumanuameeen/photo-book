import { IHelpContent } from "../../model/helpContentModel.ts";

export interface IHelpService {
    getAllHelpContent(): Promise<IHelpContent[]>;
    getHelpByCategory(category: string): Promise<IHelpContent | null>;
    createHelpSection(data: Partial<IHelpContent>): Promise<IHelpContent>;
    updateHelpSection(id: string, data: Partial<IHelpContent>): Promise<IHelpContent | null>;
    deleteHelpSection(id: string): Promise<boolean>;
    reorderSections(id: string, newOrder: number): Promise<IHelpContent | null>;
}
