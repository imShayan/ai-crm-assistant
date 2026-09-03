import { createClient } from "../../lib/supabase/client";

const supabase = createClient();

export async function getCustomers(user_id: string) {
  const { data, error } = await supabase.from("customers").select("*").eq("user_id", user_id);
    if (error) {
    console.error("Error fetching customers:", error);
    return [];
  } else {
    return data;
  }
}

export async function addCustomer(customer: { name: string; email: string; company: string ,status: string, user_id: string}) {
  const { data, error } = await supabase.from("customers").insert(customer).select();
  if (error) {
    console.error("Error adding customer:", error);
    return null;
  } else {
    return data[0];
  }
}

export async function deleteCustomer(id: number, user_id: string) {
  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id)
    .select("id");
  if (error) {
    console.error("Error deleting customer:", error);
    return null;
  } else {
    return data.length > 0;
  }
}

export async function updateCustomer(id: number, user_id: string, updates: { name?: string; email?: string; company?: string; status?: string }) {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user_id)
    .select();
    if (error) {
    console.error("Error updating customer:", error);
    return null;
  } else {
    return data[0];
  } 
}
