import type { Customer } from "@/types/customer";

async function readResponse<T>(response: Response): Promise<T> {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message ?? "Customer request failed");
  }

  return result;
}

export async function getCustomers() {
  const response = await fetch("/api/customers");
  return readResponse<Customer[]>(response);
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
  return readResponse<{ success: boolean; customer?: Customer }>(response);
}

export async function deleteCustomer(id: number) {
  const response = await fetch(`/api/customers?id=${id}`, {
    method: "DELETE",
  });
  return readResponse<{ success: boolean }>(response);
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
  return readResponse<{ success: boolean; customer?: Customer }>(response);
}
