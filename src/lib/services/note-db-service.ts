import {createSupabaseServerClient} from "../supabase/server";


export async function getNotes(customerId: number, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customer_notes")
    .select("*")
    .eq("customer_id", customerId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  return { notes: data ?? [], error };
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

  return data[0];
}