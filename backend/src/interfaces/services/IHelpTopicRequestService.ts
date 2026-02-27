import { IHelpTopicRequest } from "../../model/helpTopicRequestModel.ts";

export interface IHelpTopicRequestService {
  createRequest(data: Partial<IHelpTopicRequest>): Promise<IHelpTopicRequest>;
  getAllRequests(): Promise<IHelpTopicRequest[]>;
  updateRequestStatus(id: string, status: IHelpTopicRequest["status"]): Promise<IHelpTopicRequest>;
}
