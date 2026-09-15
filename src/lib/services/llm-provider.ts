export type StructuredGenerationRequest = {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  responseSchema: Record<string, unknown>;
};

export class LlmProviderError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "CONFIGURATION"
      | "TIMEOUT"
      | "RATE_LIMITED"
      | "PROVIDER"
      | "INVALID_OUTPUT",
  ) {
    super(message);
    this.name = "LlmProviderError";
  }
}

export interface LlmProvider {
  generateStructured(request: StructuredGenerationRequest): Promise<unknown>;
}

const PROVIDER_TIMEOUT_MS = 15_000;

export function createGroqProvider(): LlmProvider {
  return {
    async generateStructured(request) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new LlmProviderError(
          "AI provider is not configured",
          "CONFIGURATION",
        );
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: request.model,
              temperature: 0.2,
              messages: [
                { role: "system", content: request.systemPrompt },
                { role: "user", content: request.userPrompt },
              ],
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "customer_summary",
                  strict: true,
                  schema: request.responseSchema,
                },
              },
            }),
            signal: controller.signal,
          },
        );

        if (response.status === 429) {
          throw new LlmProviderError(
            "AI provider rate limit reached",
            "RATE_LIMITED",
          );
        }
        if (!response.ok) {
          throw new LlmProviderError("AI provider request failed", "PROVIDER");
        }

        const payload: unknown = await response.json();
        const content =
          typeof payload === "object" &&
          payload !== null &&
          "choices" in payload &&
          Array.isArray(payload.choices) &&
          payload.choices[0] &&
          typeof payload.choices[0] === "object" &&
          "message" in payload.choices[0] &&
          payload.choices[0].message &&
          typeof payload.choices[0].message === "object" &&
          "content" in payload.choices[0].message &&
          typeof payload.choices[0].message.content === "string"
            ? payload.choices[0].message.content
            : null;

        if (!content) {
          throw new LlmProviderError(
            "AI provider returned no usable output",
            "INVALID_OUTPUT",
          );
        }

        try {
          return JSON.parse(content);
        } catch {
          throw new LlmProviderError(
            "AI provider returned invalid JSON",
            "INVALID_OUTPUT",
          );
        }
      } catch (error) {
        if (error instanceof LlmProviderError) {
          throw error;
        }
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new LlmProviderError(
            "AI provider request timed out",
            "TIMEOUT",
          );
        }
        throw new LlmProviderError("AI provider request failed", "PROVIDER");
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
