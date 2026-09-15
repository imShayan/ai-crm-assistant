import { z } from "zod";
import {
  createGroqProvider,
  LlmProviderError,
} from "@/lib/services/llm-provider";

const MAX_NOTES = 10;
const MAX_NOTE_LENGTH = 800;
const MAX_CONTEXT_LENGTH = 6_000;
const summarySchema = z.object({
  summary: z.string().trim().min(1).max(1_000),
  key_points: z.array(z.string().trim().min(1).max(240)).max(5),
  next_step: z.string().trim().min(1).max(500),
  insufficient_context: z.boolean(),
}).strict();

export type SummaryResult = z.infer<typeof summarySchema>;

export type SummaryContext = {
  customer: {
    name: string;
    company: string;
    status: string;
  };
  notes: Array<{
    note: string;
    created_at: string;
  }>;
};

export class AiServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "CONFIGURATION"
      | "INSUFFICIENT_CONTEXT"
      | "TIMEOUT"
      | "RATE_LIMITED"
      | "PROVIDER"
      | "INVALID_OUTPUT",
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

function buildContext(context: SummaryContext) {
  const notes = context.notes
    .slice(0, MAX_NOTES)
    .map(
      ({ note, created_at }, index) =>
        `${index + 1}. ${note.slice(0, MAX_NOTE_LENGTH)} (${created_at})`,
    )
    .join("\n");

  return [
    `Customer name: ${context.customer.name}`,
    `Company: ${context.customer.company}`,
    `Status: ${context.customer.status}`,
    "Customer notes:",
    notes,
  ]
    .join("\n")
    .slice(0, MAX_CONTEXT_LENGTH);
}

function buildPrompt(context: SummaryContext) {
  return `You summarize CRM customer activity for a sales representative.

Use only the customer information and notes below. Do not invent facts, intent,
dates, commitments, or outcomes. If the notes do not support a useful
conclusion, set insufficient_context to true and explain that in summary.

Return only JSON matching the requested schema:
- summary: one concise factual paragraph
- key_points: up to five factual observations
- next_step: one practical follow-up based only on the context
- insufficient_context: true when the available context is too limited

CRM context:
${buildContext(context)}`;
}

function formatSummary(result: SummaryResult) {
  const keyPoints = result.key_points.map((point) => `- ${point}`).join("\n");
  return `${result.summary}\n\nKey points:\n${keyPoints}\n\nNext step:\n${result.next_step}`;
}

export async function generateSummary(context: SummaryContext) {
  if (context.notes.length === 0) {
    throw new AiServiceError(
      "At least one customer note is required to generate a summary",
      "INSUFFICIENT_CONTEXT",
    );
  }

  try {
    const parsed = await createGroqProvider().generateStructured({
      model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
      systemPrompt:
        "You produce cautious, factual CRM summaries from authorized customer context.",
      userPrompt: buildPrompt(context),
      responseSchema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          key_points: { type: "array", items: { type: "string" } },
          next_step: { type: "string" },
          insufficient_context: { type: "boolean" },
        },
        required: [
          "summary",
          "key_points",
          "next_step",
          "insufficient_context",
        ],
        additionalProperties: false,
      },
    });

    const result = summarySchema.safeParse(parsed);
    if (!result.success) {
      throw new AiServiceError("AI provider returned an invalid summary", "INVALID_OUTPUT");
    }

    if (result.data.insufficient_context) {
      throw new AiServiceError(
        "The customer does not have enough context for a useful summary",
        "INSUFFICIENT_CONTEXT",
      );
    }

    return {
      structured: result.data,
      text: formatSummary(result.data),
    };
  } catch (error) {
    if (error instanceof AiServiceError) {
      throw error;
    }
    if (error instanceof LlmProviderError) {
      throw new AiServiceError(error.message, error.code);
    }
    throw error;
  }
}

export async function generateRecommendation(notes: string[]) {
  void notes;
  return `
1. Schedule product demo
2. Send pricing sheet
3. Follow up within 3 days
`;
}
