import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOwnedCustomer(customerId: number, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("user_id", userId)
    .maybeSingle();

  return { customer: data, error };
}
