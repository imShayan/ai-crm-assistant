export async function getCustomers() {
  const response = await fetch("/api/customers");
  const customers = await response.json();
  return customers;
}

export async function addCustomer(customer: { name: string; email: string; company: string }) {
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });
  const result = await response.json();
  return result;
}

export async function deleteCustomer(id: number) {
  const response = await fetch(`/api/customers?id=${id}`, {
    method: "DELETE",
  });
  const result = await response.json();
  return result;
}

export async function editCustomer(id: number, customer: { name: string; email: string; company: string }) {
  const response = await fetch(`/api/customers?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });
  const result = await response.json();
  return result;
}
