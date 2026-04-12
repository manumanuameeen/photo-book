import { ChatMessage } from "../../services/external/chatbot.service";

export interface AiSearchResponse {
  success: boolean;
  query: string;
  results: any[];
  count: number;
}

export interface SuggestAlbumNameResponse {
  success: boolean;
  albumId: string;
  suggestedName: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  messages: any[];
}

export interface IAiService {
  searchPhotos(query: string): Promise<AiSearchResponse>;
  suggestAlbumName(albumId: string): Promise<SuggestAlbumNameResponse>;
  getChatbotHistory(userId: string, sessionId?: string): Promise<ChatHistoryResponse>;
  handleChatbotMessage(
    messages: ChatMessage[],
    userId: string,
    sessionId?: string
  ): Promise<any>;
}
