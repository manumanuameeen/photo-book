import { IHelpTopicRequest } from "../../../models/helpTopicRequest.model";
import { IHelpTopicRequestRepository } from "../../../interfaces/repositories/IHelpTopicRequestRepository";
import { IHelpTopicRequestService } from "../../../interfaces/services/IHelpTopicRequestService";

export class HelpTopicRequestService implements IHelpTopicRequestService {
  private readonly _repository: IHelpTopicRequestRepository;

  constructor(repository: IHelpTopicRequestRepository) {
    this._repository = repository;
  }

  async createRequest(data: Partial<IHelpTopicRequest>): Promise<IHelpTopicRequest> {
    if (!data.user || !data.topic) throw new Error("User and topic are required");

    const existing = await this._repository.findByUserAndTopic(data.user.toString(), data.topic);
    if (existing) {
      const error = new Error(
        "You have already suggested this topic. It is currently under review.",
      );
      Object.assign(error, { statusCode: 409 });
      throw error;
    }

    return await this._repository.create(data);
  }

  async getAllRequests(): Promise<IHelpTopicRequest[]> {
    return await this._repository.findAllWithUser();
  }

  async updateRequestStatus(
    id: string,
    status: IHelpTopicRequest["status"],
  ): Promise<IHelpTopicRequest> {
    const request = await this._repository.update(id, { status } as Partial<IHelpTopicRequest>);
    if (!request) throw new Error("Request not found");
    return request;
  }
}
