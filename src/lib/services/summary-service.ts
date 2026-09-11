import { readApiResponse } from "@/lib/api-response";

export async function generateSummary(customerId: number) {
  const response = await fetch("/api/summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customerId }),
  });
  const data = await readApiResponse<{ summary: Record<string, unknown> }>(response);
  return data.summary;
}

export async function fetchSummary(customerId: number) {
  const response = await fetch(`/api/summary?customerId=${customerId}`);
  return readApiResponse<{ summary: Record<string, unknown> }>(response);
}