import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AiServiceError,
  generateSummary,
} from "@/lib/services/ai-service";

const context = {
  customer: {
    name: "Ada Lovelace",
    company: "Analytical Engines",
    status: "Active",
  },
  notes: [
    {
      note: "Discussed pricing and requested a follow-up.",
      created_at: "2026-09-12T00:00:00Z",
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("AI summary service", () => {
  it("sends bounded customer context and validates structured output", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    summary: "The customer discussed pricing.",
                    key_points: ["Pricing was discussed"],
                    next_step: "Follow up with pricing details.",
                    insufficient_context: false,
                  }),
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const result = await generateSummary(context);
    const request = vi.mocked(fetch).mock.calls[0][1];
    const body = JSON.parse(String(request?.body));

    expect(result.text).toContain("The customer discussed pricing.");
    expect(body.model).toBe("openai/gpt-oss-20b");
    expect(body.response_format.json_schema.strict).toBe(true);
    expect(body.messages[1].content).toContain("Ada Lovelace");
    expect(body.messages[1].content).toContain("Discussed pricing");
  });

  it("rejects empty context before calling the provider", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      generateSummary({ ...context, notes: [] }),
    ).rejects.toMatchObject<AiServiceError>({
      code: "INSUFFICIENT_CONTEXT",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed and schema-invalid provider output", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              choices: [{ message: { content: "not-json" } }],
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              choices: [
                {
                  message: {
                    content: JSON.stringify({ summary: "Missing fields" }),
                  },
                },
              ],
            }),
            { status: 200 },
          ),
        ),
    );

    await expect(generateSummary(context)).rejects.toMatchObject({
      code: "INVALID_OUTPUT",
    });
    await expect(generateSummary(context)).rejects.toMatchObject({
      code: "INVALID_OUTPUT",
    });
  });

  it("bounds note count, note length, and total prompt size", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    summary: "Bounded context summary.",
                    key_points: [],
                    next_step: "Follow up.",
                    insufficient_context: false,
                  }),
                },
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    await generateSummary({
      ...context,
      notes: Array.from({ length: 12 }, (_, index) => ({
        note: `${index + 1}: ${"x".repeat(1_000)}`,
        created_at: "2026-09-12T00:00:00Z",
      })),
    });

    const request = vi.mocked(fetch).mock.calls[0][1];
    const body = JSON.parse(String(request?.body));
    const prompt = body.messages[1].content as string;

    expect(prompt).toContain("1: ");
    expect(prompt).not.toContain("11: ");
    expect(prompt.length).toBeLessThanOrEqual(7_000);
  });

  it("maps provider rate limits and failures", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(new Response("{}", { status: 429 }))
        .mockResolvedValueOnce(new Response("{}", { status: 500 })),
    );

    await expect(generateSummary(context)).rejects.toMatchObject({
      code: "RATE_LIMITED",
    });
    await expect(generateSummary(context)).rejects.toMatchObject({
      code: "PROVIDER",
    });
  });

  it("maps provider timeouts", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError")),
    );

    await expect(generateSummary(context)).rejects.toMatchObject({
      code: "TIMEOUT",
    });
  });
});
