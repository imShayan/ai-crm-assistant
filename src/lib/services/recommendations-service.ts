import { readApiResponse } from "@/lib/api-response";

export async function generateRecommendation(customerId: number) {
  const response = await fetch("/api/recommendation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId,
    }),
  });
  const data = await readApiResponse<{ recommendation: Record<string, unknown> }>(response);
  return { success: true, recommendation: data.recommendation };
}

export async function fetchRecommendation(customerId: number) {
  const response = await fetch(`/api/recommendation?customerId=${customerId}`);
  const data = await readApiResponse<{ recommendation: Record<string, unknown> }>(response);
  return { success: true, recommendation: data.recommendation };
}
