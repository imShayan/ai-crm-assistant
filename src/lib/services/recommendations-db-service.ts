import { createSupabaseServerClient } from "../supabase/server";
import type { DatabaseResult } from "./database-result";

export async function saveRecommendation(recommendation: {
  customer_id: number;
  user_id: string;
  recommendation: string;
}): Promise<DatabaseResult<Record<string, unknown>>> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("customer_recommendations")
    .insert(recommendation)
    .select();

  if (error) {
    console.error(error);
  }

  return {
    data: data?.[0] ?? null,
    error: error ? new Error(error.message) : null,
  };
}

export async function getRecommendation(
  customerId: number,
  userId: string,
): Promise<DatabaseResult<Record<string, unknown>>> {

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
  }

  return {
    data: data?.[0] ?? null,
    error: error ? new Error(error.message) : null,
  };
}
