import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentServerUser: vi.fn(),
  getOwnedCustomer: vi.fn(),
  addNote: vi.fn(),
  getNotes: vi.fn(),
  getSummary: vi.fn(),
  saveSummary: vi.fn(),
  getRecommendation: vi.fn(),
  saveRecommendation: vi.fn(),
  generateSummary: vi.fn(),
  generateRecommendation: vi.fn(),
}));

vi.mock("@/lib/services/server-auth-service", () => ({
  getCurrentServerUser: mocks.getCurrentServerUser,
}));
vi.mock("@/lib/services/customer-authorization-service", () => ({
  getOwnedCustomer: mocks.getOwnedCustomer,
}));
vi.mock("@/lib/services/note-db-service", () => ({
  addNote: mocks.addNote,
  getNotes: mocks.getNotes,
}));
vi.mock("@/lib/services/summary-db-service", () => ({
  getSummary: mocks.getSummary,
  saveSummary: mocks.saveSummary,
}));
vi.mock("@/lib/services/recommendations-db-service", () => ({
  getRecommendation: mocks.getRecommendation,
  saveRecommendation: mocks.saveRecommendation,
}));
vi.mock("@/lib/services/ai-service", () => ({
  generateSummary: mocks.generateSummary,
  generateRecommendation: mocks.generateRecommendation,
}));

import * as notesRoute from "@/app/api/notes/route";
import * as summaryRoute from "@/app/api/summary/route";
import * as recommendationRoute from "@/app/api/recommendation/route";

const user = { id: "user-a" };

function jsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function responseBody(response: Response) {
  return response.json();
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getCurrentServerUser.mockResolvedValue(user);
  mocks.getOwnedCustomer.mockResolvedValue({
    customer: { id: 42 },
    error: null,
  });
  mocks.getNotes.mockResolvedValue({
    data: [{ note: "Discussed pricing" }],
    error: null,
  });
  mocks.addNote.mockResolvedValue({
    data: { id: 1, customer_id: 42, user_id: user.id },
    error: null,
  });
  mocks.generateSummary.mockResolvedValue("Summary");
  mocks.saveSummary.mockResolvedValue({ data: { summary: "Summary" }, error: null });
  mocks.generateRecommendation.mockResolvedValue("Recommendation");
  mocks.saveRecommendation.mockResolvedValue({
    data: { recommendation: "Recommendation" },
    error: null,
  });
  mocks.getSummary.mockResolvedValue({
    data: { summary: "Summary" },
    error: null,
  });
  mocks.getRecommendation.mockResolvedValue({
    data: { recommendation: "Recommendation" },
    error: null,
  });
});

describe("notes authorization", () => {
  it("returns 401 for unauthenticated reads and writes", async () => {
    mocks.getCurrentServerUser.mockResolvedValue(null);

    const getResponse = await notesRoute.GET(
      new Request("http://localhost/api/notes?customerId=42"),
    );
    const postResponse = await notesRoute.POST(
      jsonRequest("http://localhost/api/notes", {
        customer_id: 42,
        note: "Private note",
      }),
    );

    expect(getResponse.status).toBe(401);
    expect(postResponse.status).toBe(401);
    expect(mocks.getOwnedCustomer).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid customer IDs before ownership lookup", async () => {
    const response = await notesRoute.GET(
      new Request("http://localhost/api/notes?customerId=not-an-id"),
    );

    expect(response.status).toBe(400);
    expect(mocks.getOwnedCustomer).not.toHaveBeenCalled();
  });

  it("returns 404 and does not read or create notes for an unowned customer", async () => {
    mocks.getOwnedCustomer.mockResolvedValue({ customer: null, error: null });

    const getResponse = await notesRoute.GET(
      new Request("http://localhost/api/notes?customerId=99"),
    );
    const postResponse = await notesRoute.POST(
      jsonRequest("http://localhost/api/notes", {
        customer_id: 99,
        note: "Attempted access",
      }),
    );

    expect(getResponse.status).toBe(404);
    expect(postResponse.status).toBe(404);
    expect(mocks.getNotes).not.toHaveBeenCalled();
    expect(mocks.addNote).not.toHaveBeenCalled();
  });

  it("uses the authenticated user ID when creating an owned customer's note", async () => {
    const response = await notesRoute.POST(
      jsonRequest("http://localhost/api/notes", {
        customer_id: 42,
        note: "  Follow up tomorrow  ",
        user_id: "user-b",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.getOwnedCustomer).toHaveBeenCalledWith(42, "user-a");
    expect(mocks.addNote).toHaveBeenCalledWith({
      customer_id: 42,
      note: "Follow up tomorrow",
      user_id: "user-a",
    });
  });
});

describe("summary authorization", () => {
  it("returns 401 for unauthenticated reads", async () => {
    mocks.getCurrentServerUser.mockResolvedValue(null);

    const response = await summaryRoute.GET(
      new Request("http://localhost/api/summary?customerId=42"),
    );

    expect(response.status).toBe(401);
    expect(mocks.getOwnedCustomer).not.toHaveBeenCalled();
  });

  it("returns 404 before generating a summary for an unowned customer", async () => {
    mocks.getOwnedCustomer.mockResolvedValue({ customer: null, error: null });

    const response = await summaryRoute.POST(
      jsonRequest("http://localhost/api/summary", { customerId: 99 }),
    );

    expect(response.status).toBe(404);
    expect(mocks.getNotes).not.toHaveBeenCalled();
    expect(mocks.generateSummary).not.toHaveBeenCalled();
    expect(mocks.saveSummary).not.toHaveBeenCalled();
  });

  it("generates and saves a summary only after ownership is verified", async () => {
    const response = await summaryRoute.POST(
      jsonRequest("http://localhost/api/summary", { customerId: 42 }),
    );

    expect(response.status).toBe(200);
    expect(mocks.getOwnedCustomer).toHaveBeenCalledWith(42, "user-a");
    expect(mocks.generateSummary).toHaveBeenCalledWith(["Discussed pricing"]);
    expect(mocks.saveSummary).toHaveBeenCalledWith({
      customer_id: 42,
      user_id: "user-a",
      summary: "Summary",
    });
  });
});

describe("recommendation authorization", () => {
  it("returns 400 for invalid customer IDs before ownership lookup", async () => {
    const response = await recommendationRoute.GET(
      new Request("http://localhost/api/recommendation?customerId=0"),
    );

    expect(response.status).toBe(400);
    expect(mocks.getOwnedCustomer).not.toHaveBeenCalled();
  });

  it("returns 404 before generating a recommendation for an unowned customer", async () => {
    mocks.getOwnedCustomer.mockResolvedValue({ customer: null, error: null });

    const response = await recommendationRoute.POST(
      jsonRequest("http://localhost/api/recommendation", { customerId: 99 }),
    );

    expect(response.status).toBe(404);
    expect(mocks.getNotes).not.toHaveBeenCalled();
    expect(mocks.generateRecommendation).not.toHaveBeenCalled();
    expect(mocks.saveRecommendation).not.toHaveBeenCalled();
  });

  it("generates and saves a recommendation only for an owned customer", async () => {
    const response = await recommendationRoute.POST(
      jsonRequest("http://localhost/api/recommendation", { customerId: 42 }),
    );

    expect(response.status).toBe(200);
    expect(mocks.getOwnedCustomer).toHaveBeenCalledWith(42, "user-a");
    expect(mocks.generateRecommendation).toHaveBeenCalledWith(["Discussed pricing"]);
    expect(mocks.saveRecommendation).toHaveBeenCalledWith({
      customer_id: 42,
      user_id: "user-a",
      recommendation: "Recommendation",
    });
  });
});

describe("subresource database failures", () => {
  it("returns 500 instead of treating a notes query failure as an empty list", async () => {
    mocks.getNotes.mockResolvedValue({
      data: [],
      error: new Error("database unavailable"),
    });

    const response = await notesRoute.GET(
      new Request("http://localhost/api/notes?customerId=42"),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when creating a note fails", async () => {
    mocks.addNote.mockResolvedValue({
      data: null,
      error: new Error("database unavailable"),
    });

    const response = await notesRoute.POST(
      jsonRequest("http://localhost/api/notes", {
        customer_id: 42,
        note: "Attempted note",
      }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when reading a summary fails", async () => {
    mocks.getSummary.mockResolvedValue({
      data: null,
      error: new Error("database unavailable"),
    });

    const response = await summaryRoute.GET(
      new Request("http://localhost/api/summary?customerId=42"),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when saving a summary fails", async () => {
    mocks.saveSummary.mockResolvedValue({
      data: null,
      error: new Error("database unavailable"),
    });

    const response = await summaryRoute.POST(
      jsonRequest("http://localhost/api/summary", { customerId: 42 }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when reading a recommendation fails", async () => {
    mocks.getRecommendation.mockResolvedValue({
      data: null,
      error: new Error("database unavailable"),
    });

    const response = await recommendationRoute.GET(
      new Request("http://localhost/api/recommendation?customerId=42"),
    );

    expect(response.status).toBe(500);
  });

  it("returns 500 when saving a recommendation fails", async () => {
    mocks.saveRecommendation.mockResolvedValue({
      data: null,
      error: new Error("database unavailable"),
    });

    const response = await recommendationRoute.POST(
      jsonRequest("http://localhost/api/recommendation", { customerId: 42 }),
    );

    expect(response.status).toBe(500);
  });
});
