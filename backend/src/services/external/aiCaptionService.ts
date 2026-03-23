/**
 * AI Caption Service
 * Automatically generates captions for uploaded photos using Hugging Face BLIP model
 */

export interface ICaptionResult {
  caption: string;
  success: boolean;
}

/**
 * Generates an AI caption for a given base64 image
 * @param imageBase64 - Base64 encoded image string
 * @returns Caption result with success status
 */
export async function generateCaption(imageBase64: string): Promise<ICaptionResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
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
      console.error(`[aiCaptionService] HuggingFace API error: ${response.status}`);
      return { caption: "A beautiful photo", success: false };
    }

    type IBlipItem = { generated_text?: string };
    const result = (await response.json()) as IBlipItem[];
    const caption = result[0]?.generated_text || "A beautiful photo";

    return { caption, success: true };
  } catch (error: unknown) {
    console.error("[aiCaptionService] Error generating caption:", error);
    return { caption: "A beautiful photo", success: false };
  }
}
