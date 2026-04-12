export interface IAiService {
  getChatResponse(
    userMessage: string,
    history?: { role: "user" | "model"; content: string }[],
  ): Promise<string>;
}
