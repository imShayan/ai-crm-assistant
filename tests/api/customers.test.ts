import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentServerUser: vi.fn(),
  getCustomers: vi.fn(),
  addCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}));

vi.mock("@/lib/services/server-auth-service", () => ({
  getCurrentServerUser: mocks.getCurrentServerUser,
}));
vi.mock("@/lib/services/customer-db-service", () => ({
  getCustomers: mocks.getCustomers,
  addCustomer: mocks.addCustomer,
  deleteCustomer: mocks.deleteCustomer,
  updateCustomer: mocks.updateCustomer,
}));

import * as customersRoute from "@/app/api/customers/route";

const user = { id: "user-a" };
const customer = {
  id: 42,
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  status: "Active",
};

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getCurrentServerUser.mockResolvedValue(user);
  mocks.getCustomers.mockResolvedValue({ data: [customer], error: null });
  mocks.addCustomer.mockResolvedValue({ data: customer, error: null });
  mocks.deleteCustomer.mockResolvedValue({ data: true, error: null });
  mocks.updateCustomer.mockResolvedValue({ data: customer, error: null });
});

describe("customer CRUD route", () => {
  it("returns customers for an authenticated user", async () => {
    const response = await customersRoute.GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([customer]);
    expect(mocks.getCustomers).toHaveBeenCalledWith(user.id);
  });

  it("creates, updates, and deletes customers after successful database operations", async () => {
    const createResponse = await customersRoute.POST(
      jsonRequest("http://localhost/api/customers", "POST", {
        name: "Ada Lovelace",
        email: "ada@example.com",
        company: "Analytical Engines",
        status: "Active",
      }),
    );
    const updateResponse = await customersRoute.PUT(
      jsonRequest("http://localhost/api/customers?id=42", "PUT", {
        name: "Ada Lovelace",
      }),
    );
    const deleteResponse = await customersRoute.DELETE(
      new Request("http://localhost/api/customers?id=42", { method: "DELETE" }),
    );

    expect(createResponse.status).toBe(200);
    expect((await createResponse.json()).customer).toEqual(customer);
    expect(updateResponse.status).toBe(200);
    expect((await updateResponse.json()).customer).toEqual(customer);
    expect(deleteResponse.status).toBe(200);
    expect(await deleteResponse.json()).toEqual({ success: true });
  });

  it("preserves authentication and validation failures", async () => {
    mocks.getCurrentServerUser.mockResolvedValue(null);
    const unauthenticatedResponse = await customersRoute.GET();
    expect(unauthenticatedResponse.status).toBe(401);

    mocks.getCurrentServerUser.mockResolvedValue(user);
    const invalidResponse = await customersRoute.POST(
      jsonRequest("http://localhost/api/customers", "POST", { name: "Missing fields" }),
    );
    expect(invalidResponse.status).toBe(400);
    expect(mocks.addCustomer).not.toHaveBeenCalled();
  });

  it("returns not found for missing update and delete targets", async () => {
    mocks.updateCustomer.mockResolvedValue({ data: null, error: null });
    mocks.deleteCustomer.mockResolvedValue({ data: false, error: null });

    const updateResponse = await customersRoute.PUT(
      jsonRequest("http://localhost/api/customers?id=42", "PUT", { name: "Ada" }),
    );
    const deleteResponse = await customersRoute.DELETE(
      new Request("http://localhost/api/customers?id=42", { method: "DELETE" }),
    );

    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
  });

  it("returns database failures instead of success responses", async () => {
    const databaseError = new Error("database unavailable");
    mocks.getCustomers.mockResolvedValue({ data: null, error: databaseError });
    mocks.addCustomer.mockResolvedValue({ data: null, error: databaseError });
    mocks.deleteCustomer.mockResolvedValue({ data: null, error: databaseError });
    mocks.updateCustomer.mockResolvedValue({ data: null, error: databaseError });

    const getResponse = await customersRoute.GET();
    const createResponse = await customersRoute.POST(
      jsonRequest("http://localhost/api/customers", "POST", {
        name: "Ada",
        email: "ada@example.com",
        company: "Analytical Engines",
        status: "Active",
      }),
    );
    const deleteResponse = await customersRoute.DELETE(
      new Request("http://localhost/api/customers?id=42", { method: "DELETE" }),
    );
    const updateResponse = await customersRoute.PUT(
      jsonRequest("http://localhost/api/customers?id=42", "PUT", { name: "Ada" }),
    );

    expect(getResponse.status).toBe(500);
    expect(createResponse.status).toBe(500);
    expect(deleteResponse.status).toBe(500);
    expect(updateResponse.status).toBe(500);
    expect((await createResponse.json()).success).toBe(false);
  });
});
