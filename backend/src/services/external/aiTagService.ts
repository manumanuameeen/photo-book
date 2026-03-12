/**
 * AI Tag Service
 * Automatically generates tags for uploaded photos using Hugging Face ViT model
 */

export interface ITagResult {
  tags: string[];
  success: boolean;
}

export interface IHFClassification {
  label: string;
  score: number;
}

/**
 * Generates AI tags for a given base64 image
 * @param imageBase64 - Base64 encoded image string
 * @returns Tag result with success status
 */
export async function generateTags(imageBase64: string): Promise<ITagResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: imageBase64 }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[aiTagService] HuggingFace API error: ${response.status}`);
      return { tags: [], success: false };
    }

    const results = (await response.json()) as any as IHFClassification[];

    const tags = results
      .filter((r) => r.score > 0.3)
      .map((r) => r.label.toLowerCase().trim());

    return { tags, success: true };
  } catch (error: any) {
    console.error("[aiTagService] Error generating tags:", error);
    return { tags: [], success: false };
  }
}
