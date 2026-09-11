import { readApiResponse } from "@/lib/api-response";

export async function createNote(
  customerId: number,
  note: string
) {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer_id: customerId,
      note,
    }),
  });

  return readApiResponse<{ note: Record<string, unknown> }>(response);
}

export async function getNotes(customerId: number) {
  const response = await fetch(`/api/notes?customerId=${customerId}`);
  return readApiResponse<{ notes: Array<{ note: string; created_at: string }> }>(response);
}   