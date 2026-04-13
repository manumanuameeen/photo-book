import { BaseRepository } from "../base/BaseRepository";
import { IHelpTopicRequest, HelpTopicRequestModel } from "../../models/helpTopicRequest.model";
import { IHelpTopicRequestRepository } from "../../interfaces/repositories/IHelpTopicRequestRepository";

export class HelpTopicRequestRepository
  extends BaseRepository<IHelpTopicRequest>
  implements IHelpTopicRequestRepository
{
  constructor() {
    super(HelpTopicRequestModel);
  }

  async findAllWithUser(): Promise<IHelpTopicRequest[]> {
    return await this._model.find().populate("user", "name email").sort({ createdAt: -1 });
  }

  async findByUserAndTopic(userId: string, topic: string): Promise<IHelpTopicRequest | null> {
    return await this._model.findOne({
      user: userId,
      topic: { $regex: new RegExp(`^${topic.trim()}$`, "i") },
      status: "pending",
    });
  }
}

