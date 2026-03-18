import { IHelpTopicRequest } from "../../models/helpTopicRequest.model.ts";
import { IBaseRepository } from "./IBaseRepository.ts";

export interface IHelpTopicRequestRepository extends IBaseRepository<IHelpTopicRequest> {
  findAllWithUser(): Promise<IHelpTopicRequest[]>;
  findByUserAndTopic(userId: string, topic: string): Promise<IHelpTopicRequest | null>;
}
