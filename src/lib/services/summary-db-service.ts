import {createSupabaseServerClient} from "../supabase/server";
import type { DatabaseResult } from "./database-result";

export async function saveSummary(summary:  {
  customer_id: number;
  user_id: string;
  summary: string;
}): Promise<DatabaseResult<Record<string, unknown>>> {
    const supabase= await createSupabaseServerClient();

    const { data, error } = await supabase
    .from("customer_summaries")
    .insert(summary)
    .select();
    if (error) {
        console.error(error);
    }

    if (error) {
        return { data: null, error: new Error(error.message) };
    }
    if (!data?.[0]) {
        return { data: null, error: new Error("Summary insert returned no row") };
    }
    return { data: data[0], error: null };
};


export async function getSummary(
    customerId: number,
    userId: string,
): Promise<DatabaseResult<Record<string, unknown>>> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
    .from("customer_summaries")
    .select("*")
    .eq("customer_id", customerId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);
    if (error) {
        console.error(error);
    }   
    
    if (error) {
        return { data: null, error: new Error(error.message) };
    }
    return { data: data?.[0] ?? null, error: null };
};