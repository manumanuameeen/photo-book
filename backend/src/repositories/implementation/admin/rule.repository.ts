import { IRule, RuleModel } from "../../../models/rule.model";

export interface IRuleRepository {
  create(ruleData: Partial<IRule>): Promise<IRule>;
  findAll(): Promise<IRule[]>;
  findById(id: string): Promise<IRule | null>;
  update(id: string, ruleData: Partial<IRule>): Promise<IRule | null>;
  delete(id: string): Promise<boolean>;
}

export class RuleRepository implements IRuleRepository {
  async create(ruleData: Partial<IRule>): Promise<IRule> {
    return await RuleModel.create(ruleData);
  }

  async findAll(): Promise<IRule[]> {
    return await RuleModel.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IRule | null> {
    return await RuleModel.findById(id);
  }

  async update(id: string, ruleData: Partial<IRule>): Promise<IRule | null> {
    return await RuleModel.findByIdAndUpdate(id, ruleData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await RuleModel.findByIdAndDelete(id);
    return !!result;
  }
}
