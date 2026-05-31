export async function getCustomers() {
  const response = await fetch("/api/customers");
  const customers = await response.json();
  return customers;
}