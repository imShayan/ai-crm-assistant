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
  return response.json();
}

export async function fetchRecommendation(customerId: number) {
  const response = await fetch(`/api/recommendation?customerId=${customerId}`);
  return response.json();
}
