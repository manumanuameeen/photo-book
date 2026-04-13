import { IRule } from "../../models/rule.model";
import { IRuleRepository } from "../../repositories/admin/rule.repository";

export interface IRuleService {
  createRule(data: Partial<IRule>): Promise<IRule>;
  getAllRules(): Promise<IRule[]>;
  updateRule(id: string, data: Partial<IRule>): Promise<IRule | null>;
  deleteRule(id: string): Promise<boolean>;
}

export class RuleService implements IRuleService {
  constructor(private _ruleRepository: IRuleRepository) {}

  async createRule(data: Partial<IRule>): Promise<IRule> {
    return await this._ruleRepository.create(data);
  }

  async getAllRules(): Promise<IRule[]> {
    return await this._ruleRepository.findAll();
  }

  async updateRule(id: string, data: Partial<IRule>): Promise<IRule | null> {
    return await this._ruleRepository.update(id, data);
  }

  async deleteRule(id: string): Promise<boolean> {
    return await this._ruleRepository.delete(id);
  }
}


