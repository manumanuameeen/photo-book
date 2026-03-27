import { IHelpTopicRequest } from "../../models/helpTopicRequest.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IHelpTopicRequestRepository extends IBaseRepository<IHelpTopicRequest> {
  findAllWithUser(): Promise<IHelpTopicRequest[]>;
  findByUserAndTopic(userId: string, topic: string): Promise<IHelpTopicRequest | null>;
}
