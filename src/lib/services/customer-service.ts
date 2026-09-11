import type { Customer } from "@/types/customer";
import { readApiResponse } from "@/lib/api-response";

async function readResponse<T>(response: Response): Promise<T> {
  return readApiResponse<T>(response);
}

export async function getCustomers() {
  const response = await fetch("/api/customers");
  const result = await readResponse<{ customers: Customer[] }>(response);
  return result.customers;
}

export async function addCustomer(customer: {
  name: string;
  email: string;
  company: string;
  status: string;
}) {
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });
  return readResponse<{ customer: Customer }>(response).then((data) => ({
    success: true,
    customer: data.customer,
  }));
}

export async function deleteCustomer(id: number) {
  const response = await fetch(`/api/customers?id=${id}`, {
    method: "DELETE",
  });
  return readResponse<{ deleted: boolean }>(response).then((data) => ({
    success: data.deleted,
  }));
}

export async function editCustomer(id: number, customer: {
  name: string;
  email: string;
  company: string;
  status: string;
}) {
  const response = await fetch(`/api/customers?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });
  return readResponse<{ customer: Customer }>(response).then((data) => ({
    success: true,
    customer: data.customer,
  }));
}
