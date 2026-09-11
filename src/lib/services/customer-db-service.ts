import { createSupabaseServerClient } from "../supabase/server";
import type { Customer } from "../../types/customer";
import type { DatabaseResult } from "./database-result";

type CustomerInput = {
  name: string;
  email: string;
  company: string;
  status: string;
};

export async function getCustomers(user_id: string): Promise<DatabaseResult<Customer[]>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("customers").select("*").eq("user_id", user_id);
  if (error) {
    console.error("Error fetching customers:", error);
  }

  return { data: data ?? null, error: error ? new Error(error.message) : null };
}

export async function addCustomer(
  customer: CustomerInput & { user_id: string },
): Promise<DatabaseResult<Customer>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("customers").insert(customer).select();
  if (error) {
    console.error("Error adding customer:", error);
  }

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  if (!data?.[0]) {
    return { data: null, error: new Error("Customer insert returned no row") };
  }

  return { data: data[0], error: null };
}

export async function deleteCustomer(
  id: number,
  user_id: string,
): Promise<DatabaseResult<boolean>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id)
    .select("id");
  if (error) {
    console.error("Error deleting customer:", error);
  }

  return {
    data: error ? null : data.length > 0,
    error: error ? new Error(error.message) : null,
  };
}

export async function updateCustomer(
  id: number,
  user_id: string,
  updates: Partial<CustomerInput>,
): Promise<DatabaseResult<Customer>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user_id)
    .select();
  if (error) {
    console.error("Error updating customer:", error);
  }

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  if (!data?.[0]) {
    return { data: null, error: new Error("Customer update returned no row") };
  }

  return { data: data[0], error: null };
}
