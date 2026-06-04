import {createSupabaseServerClient} from "../supabase/server";


export async function getNotes(customerId: number) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customer_notes")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  console.log("Fetched Notes:", data);
  return data;
}

export async function addNote(note: {
  customer_id: number;
  user_id: string;
  note: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customer_notes")
    .insert(note)
    .select();

  if (error) {
    console.error(error);
    return null;
  }
  console.log("New Note Added:", data[0]);
  return data[0];
}