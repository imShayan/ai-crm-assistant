import { createSupabaseServerClient } from "../supabase/server";

export async function saveRecommendation(recommendation: {
  customer_id: number;
  user_id: string;
  recommendation: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("customer_recommendations")
    .insert(recommendation)
    .select();

  if (error) {
    console.error(error);
  }

  return { recommendation: data?.[0] ?? null, error };
}

export async function getRecommendation(customerId: number, userId: string) {

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("customer_recommendations")
    .select("*")
    .eq("customer_id", customerId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error(error);
    return null;
  }

  return data[0];
}
