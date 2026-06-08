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
  console.log("API Response:", response);
  return response.json();
}

export async function fetchRecommendation(customerId: number) {
  const response = await fetch(`/api/recommendation?customerId=${customerId}`);
  console.log("Fetch Recommendation API Response:", response);
  return response.json();
}
