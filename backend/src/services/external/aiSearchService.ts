/**
 * AI Search Service
 * Semantic photo search using CLIP model embeddings via Hugging Face
 */

export interface ISearchResult {
  photoId: string;
  score: number;
}

export interface IEmbeddingResult {
  embedding: number[];
  success: boolean;
}

// shape returned by the HF CLIP endpoint (we only care about `embedding`)
interface IHuggingFaceEmbeddingResponse {
  embedding?: number[];
}

/**
 * Gets CLIP embedding for a base64 image
 * @param imageBase64 - Base64 encoded image string
 */
export async function getImageEmbedding(imageBase64: string): Promise<IEmbeddingResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: { image: imageBase64 } }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[aiSearchService] HuggingFace API error: ${response.status}`);
      return { embedding: [], success: false };
    }

    const data = (await response.json()) as IHuggingFaceEmbeddingResponse;
    return { embedding: data.embedding || [], success: true };
  } catch (error: unknown) {
    console.error("[aiSearchService] Error getting image embedding:", error);
    return { embedding: [], success: false };
  }
}

/**
 * Gets CLIP embedding for a text query
 * @param query - Text search query
 */
export async function getTextEmbedding(query: string): Promise<IEmbeddingResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: { text: query } }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[aiSearchService] HuggingFace text embedding error: ${response.status}`);
      return { embedding: [], success: false };
    }

    const data = (await response.json()) as IHuggingFaceEmbeddingResponse;
    return { embedding: data.embedding || [], success: true };
  } catch (error: unknown) {
    console.error("[aiSearchService] Error getting text embedding:", error);
    return { embedding: [], success: false };
  }
}

/**
 * Calculates cosine similarity between two embedding vectors
 * @param vecA - First embedding vector
 * @param vecB - Second embedding vector
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Ranks photos by similarity to a text query
 * @param query - Text search query
 * @param photoEmbeddings - Array of {photoId, embedding} from database
 */
export async function rankPhotosByQuery(
  query: string,
  photoEmbeddings: { photoId: string; embedding: number[] }[]
): Promise<ISearchResult[]> {
  const { embedding: queryEmbedding, success } = await getTextEmbedding(query);

  if (!success || queryEmbedding.length === 0) {
    return [];
  }

  return photoEmbeddings
    .map(({ photoId, embedding }) => ({
      photoId,
      score: cosineSimilarity(queryEmbedding, embedding),
    }))
    .filter((r) => r.score > 0.2)
    .sort((a, b) => b.score - a.score);
}
