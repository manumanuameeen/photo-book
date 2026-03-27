/**
 * Album Name Service
 * Suggests creative album names using Claude AI based on photo captions
 */

export interface IAlbumNameResult {
  name: string;
  success: boolean;
}

/**
 * Suggests a creative album name based on photo captions
 * @param captions - Array of photo captions from the album
 * @returns Suggested album name
 */
export async function suggestAlbumName(captions: string[]): Promise<IAlbumNameResult> {
  try {
    if (!captions || captions.length === 0) {
      return { name: "My Album", success: false };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: `Based on these photo captions from an album: "${captions.join("', '")}" — suggest ONE creative, short, poetic album name (3-5 words max). Reply with just the name, nothing else.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[albumNameService] Anthropic API error: ${response.status}`);
      return { name: "My Album", success: false };
    }

    interface IAnthropicMessage {
      text?: string;
    }
    interface IAnthropicResponse {
      content?: IAnthropicMessage[] /* add other fields as needed */;
    }

    const data = (await response.json()) as IAnthropicResponse;
    const name = data.content?.[0]?.text?.trim() || "My Album";

    return { name, success: true };
  } catch (error: unknown) {
    console.error("[albumNameService] Error suggesting album name:", error);
    return { name: "My Album", success: false };
  }
}
