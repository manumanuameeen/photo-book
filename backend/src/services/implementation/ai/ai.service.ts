import { IAiService, AiSearchResponse, SuggestAlbumNameResponse, ChatHistoryResponse } from "../../../interfaces/services/IAiService";
import { PortfolioSectionModel } from "../../../models/portfolioSection.model";
import { ChatHistoryModel } from "../../../models/chatHistory.model";
import { rankPhotosByQuery } from "../../../services/external/aiSearch.service";
import { suggestAlbumName as suggestAlbumNameExternal } from "../../../services/external/albumName.service";
import { getChatbotResponse, ChatMessage } from "../../../services/external/chatbot.service";

export class AiService implements IAiService {
  public async searchPhotos(query: string): Promise<AiSearchResponse> {
    // Get all portfolio images with embeddings from all photographers
    const portfolioSections = await PortfolioSectionModel.find({}, { images: 1 });
    const photoEmbeddings: { photoId: string; embedding: number[]; url: string }[] = [];

    portfolioSections.forEach((section) => {
      section.images.forEach((image, index) => {
        if (image.embedding && image.embedding.length > 0) {
          photoEmbeddings.push({
            photoId: `${section._id}_${index}`,
            embedding: image.embedding,
            url: image.url,
          });
        }
      });
    });

    const results = await rankPhotosByQuery(query, photoEmbeddings);

    // Map results to include photo URLs
    const resultsWithUrls = results.map((result) => {
      const photoData = photoEmbeddings.find((p) => p.photoId === result.photoId);
      return {
        ...result,
        url: photoData?.url || "",
      };
    });

    return {
      success: true,
      query,
      results: resultsWithUrls,
      count: resultsWithUrls.length,
    };
  }

  public async suggestAlbumName(albumId: string): Promise<SuggestAlbumNameResponse> {
    const section = await PortfolioSectionModel.findById(albumId).select("images.caption");
    if (!section) {
      throw new Error("Album not found");
    }

    const captions = section.images
      .map((img: { caption?: string }) => img.caption)
      .filter((caption): caption is string => Boolean(caption && caption.trim().length > 0));

    if (captions.length === 0) {
      throw new Error("No photo captions found in this album");
    }

    const result = await suggestAlbumNameExternal(captions);

    return {
      success: result.success,
      albumId,
      suggestedName: result.name,
    };
  }

  public async getChatbotHistory(userId: string, sessionId: string = "default"): Promise<ChatHistoryResponse> {
    const chatHistory = await ChatHistoryModel.findOne({
      userId,
      sessionId,
    });

    return {
      success: true,
      messages: chatHistory ? chatHistory.messages : [],
    };
  }

  public async handleChatbotMessage(
    messages: ChatMessage[],
    userId: string,
    sessionId: string = "default"
  ): Promise<any> {
    return await getChatbotResponse(messages, userId, sessionId);
  }
}
