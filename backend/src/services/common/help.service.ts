import { IHelpService } from "../../interfaces/services/IHelpService";
import { IHelpRepository } from "../../interfaces/repositories/IHelpRepository";
import { IHelpContent } from "../../models/helpContent.model";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";

export class HelpService implements IHelpService {
  private readonly _helpRepository: IHelpRepository;

  constructor(helpRepository: IHelpRepository) {
    this._helpRepository = helpRepository;
  }

  async getAllHelpContent(): Promise<IHelpContent[]> {
    return await this._helpRepository.getAll();
  }

  async getHelpByCategory(category: string): Promise<IHelpContent | null> {
    const content = await this._helpRepository.getByCategory(category);
    if (!content) {
      throw new AppError(`Help content for category ${category} not found`, HttpStatus.NOT_FOUND);
    }
    return content;
  }

  async createHelpSection(data: Partial<IHelpContent>): Promise<IHelpContent> {
    return await this._helpRepository.create(data);
  }

  async updateHelpSection(id: string, data: Partial<IHelpContent>): Promise<IHelpContent | null> {
    const updated = await this._helpRepository.update(id, data);
    if (!updated) {
      throw new AppError("Help section not found", HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  async deleteHelpSection(id: string): Promise<boolean> {
    const result = await this._helpRepository.delete?.(id);
    if (!result) {
      throw new AppError("Help section not found or could not be deleted", HttpStatus.NOT_FOUND);
    }
    return true;
  }

  async reorderSections(id: string, newOrder: number): Promise<IHelpContent | null> {
    const updated = await this._helpRepository.reorder(id, newOrder);
    if (!updated) {
      throw new AppError("Help section not found", HttpStatus.NOT_FOUND);
    }
    return updated;
  }
}

