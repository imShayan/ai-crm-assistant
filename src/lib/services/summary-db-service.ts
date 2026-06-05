import {createSupabaseServerClient} from "../supabase/server";

export async function saveSummary(summary:  {
  customer_id: number;
  user_id: string;
  summary: string;
}) {
    const supabase= await createSupabaseServerClient();

    const { data, error } = await supabase
    .from("customer_summaries")
    .insert(summary)
    .select();
    if (error) {
        console.error(error);
        return null;
    }

    return data[0]; 
};


export async function getSummary(customerId: number) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
    .from("customer_summaries")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1);
    if (error) {
        console.error(error);
        return null;
    }   
    
    return data[0];
};