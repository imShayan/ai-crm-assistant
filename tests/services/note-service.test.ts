import { afterEach, describe, expect, it, vi } from "vitest";

import { createNote, getNotes } from "@/lib/services/note-service";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("note client service", () => {
  it("unwraps successful API responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              success: true,
              data: { note: { id: 1, note: "Follow up" } },
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              success: true,
              data: { notes: [{ note: "Follow up", created_at: "2026-09-11T00:00:00Z" }] },
            }),
            { status: 200 },
          ),
        ),
    );

    await expect(createNote(42, "Follow up")).resolves.toEqual({
      note: { id: 1, note: "Follow up" },
    });
    await expect(getNotes(42)).resolves.toEqual({
      notes: [{ note: "Follow up", created_at: "2026-09-11T00:00:00Z" }],
    });
  });

  it("rejects API failures instead of treating them as empty notes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            error: { code: "DATABASE_ERROR", message: "Unable to load notes" },
          }),
          { status: 500 },
        ),
      ),
    );

    await expect(getNotes(42)).rejects.toThrow("Unable to load notes");
  });
});
