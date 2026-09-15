import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

import { getOwnedCustomer } from "@/lib/services/customer-authorization-service";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.createSupabaseServerClient.mockResolvedValue({ from: mocks.from });
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockReturnValue({ eq: mocks.eq, maybeSingle: mocks.maybeSingle });
  mocks.maybeSingle.mockResolvedValue({
    data: { id: 42 },
    error: null,
  });
});

describe("getOwnedCustomer", () => {
  it("queries by both customer ID and authenticated user ID", async () => {
    const result = await getOwnedCustomer(42, "user-a");

    expect(mocks.from).toHaveBeenCalledWith("customers");
    expect(mocks.select).toHaveBeenCalledWith("id, name, company, status");
    expect(mocks.eq).toHaveBeenNthCalledWith(1, "id", 42);
    expect(mocks.eq).toHaveBeenNthCalledWith(2, "user_id", "user-a");
    expect(mocks.maybeSingle).toHaveBeenCalled();
    expect(result).toEqual({
      customer: { id: 42 },
      error: null,
    });
  });

  it("returns no customer when the ownership query finds no row", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(getOwnedCustomer(42, "user-a")).resolves.toEqual({
      customer: null,
      error: null,
    });
  });
});
