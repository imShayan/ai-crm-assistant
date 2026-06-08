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
    return null;
  }

  return data[0];
}

export async function getRecommendation(customerId: number) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("customer_recommendations")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error(error);
    return null;
  }

  return data[0];
}
