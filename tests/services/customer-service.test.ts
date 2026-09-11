import { afterEach, describe, expect, it, vi } from "vitest";

import {
  addCustomer,
  deleteCustomer,
  editCustomer,
  getCustomers,
} from "@/lib/services/customer-service";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("customer client service", () => {
  it("returns successful customer responses", async () => {
    const customer = {
      id: 42,
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: "Analytical Engines",
      status: "Active",
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        success: true,
        data: { customers: [customer] },
      }), { status: 200 }),
    ));

    await expect(getCustomers()).resolves.toEqual([customer]);
  });

  it("rejects failed responses so hooks cannot treat them as successful writes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({
            success: false,
            error: { code: "NOT_FOUND", message: "Customer not found" },
          }), {
            status: 404,
          }),
        ),
      ),
    );

    await expect(deleteCustomer(42)).rejects.toThrow("Customer not found");
    await expect(addCustomer({
      name: "Ada",
      email: "ada@example.com",
      company: "Analytical Engines",
      status: "Active",
    })).rejects.toThrow("Customer not found");
    await expect(editCustomer(42, {
      name: "Ada",
      email: "ada@example.com",
      company: "Analytical Engines",
      status: "Active",
    })).rejects.toThrow("Customer not found");
  });
});
