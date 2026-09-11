import {createSupabaseServerClient} from "../supabase/server";
import type { DatabaseResult } from "./database-result";


export async function getNotes(
  customerId: number,
  userId: string,
): Promise<DatabaseResult<Array<{ note: string }>>> {
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

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data ?? [], error: null };
}

export async function addNote(note: {
  customer_id: number;
  user_id: string;
  note: string;
}): Promise<DatabaseResult<Record<string, unknown>>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customer_notes")
    .insert(note)
    .select();

  if (error) {
    console.error(error);
    return { data: null, error: new Error(error.message) };
  }

  if (!data?.[0]) {
    return { data: null, error: new Error("Note insert returned no row") };
  }

  return { data: data[0], error: null };
}