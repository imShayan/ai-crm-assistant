import { createClient } from "../../lib/supabase/client";

const supabase = createClient();

export async function getCustomers() {
  const { data, error } = await supabase.from("customers").select("*");
    if (error) {
    console.error("Error fetching customers:", error);
    return [];
  } else {
    return data;
  }
}

export async function addCustomer(customer: { name: string; email: string; company: string }) {
  const { data, error } = await supabase.from("customers").insert(customer).select();
  if (error) {
    console.error("Error adding customer:", error);
    return null;
  } else {
    return data[0];
  }
}

export async function deleteCustomer(id: number) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) {
    console.error("Error deleting customer:", error);
    return null;
  } else {
    return true;
  }
}

export async function updateCustomer(id: number, updates: { name?: string; email?: string; company?: string; status?: string }) {
  const { data, error } = await supabase.from("customers").update(updates).eq("id", id).select();  
    if (error) {
    console.error("Error updating customer:", error);
    return null;
  } else {
    return data[0];
  } 
}

