import {createSupabaseServerClient} from "../../lib/supabase/server";

export async function getCurrentServerUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting current server user:", error);
    return null;
  }

  return user;
}