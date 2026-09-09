import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  addCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  editCustomer: vi.fn(),
  getCustomers: vi.fn(),
  setCustomers: vi.fn(),
  setLoading: vi.fn(),
}));

vi.mock("react", () => ({
  useState: (initialValue: unknown) => {
    if (initialValue instanceof Array) {
      return [initialValue, mocks.setCustomers];
    }
    return [initialValue, mocks.setLoading];
  },
}));
vi.mock("@/lib/services/customer-service", () => ({
  getCustomers: mocks.getCustomers,
  addCustomer: mocks.addCustomer,
  deleteCustomer: mocks.deleteCustomer,
  editCustomer: mocks.editCustomer,
}));

import { useCustomers } from "@/hooks/useCustomers";

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("alert", vi.fn());
});

describe("useCustomers failed writes", () => {
  it("does not add a customer when the client request fails", async () => {
    mocks.addCustomer.mockRejectedValue(new Error("request failed"));

    const { addCustomer } = useCustomers();
    await addCustomer({
      name: "Ada",
      email: "ada@example.com",
      company: "Analytical Engines",
      status: "Active",
    });

    expect(mocks.setCustomers).not.toHaveBeenCalled();
  });

  it("does not delete or update local state when writes fail", async () => {
    mocks.deleteCustomer.mockRejectedValue(new Error("request failed"));
    mocks.editCustomer.mockRejectedValue(new Error("request failed"));

    const { deleteCustomer, updateCustomer } = useCustomers();
    await deleteCustomer(42);
    await updateCustomer(42, {
      name: "Ada",
      email: "ada@example.com",
      company: "Analytical Engines",
      status: "Active",
    });

    expect(mocks.setCustomers).not.toHaveBeenCalled();
  });
});
