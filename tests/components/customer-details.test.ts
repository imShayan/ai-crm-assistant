import { describe, expect, it } from "vitest";

import { buildTimeline } from "@/components/dashboard/customer-details";

describe("customer timeline", () => {
  it("renders notes when no summary exists", () => {
    const notes = [
      {
        note: "Follow up tomorrow",
        created_at: "2026-09-11T10:00:00.000Z",
      },
    ];

    expect(buildTimeline(notes, null)).toEqual([
      {
        type: "note",
        content: "Follow up tomorrow",
        created_at: "2026-09-11T10:00:00.000Z",
      },
    ]);
  });
});
