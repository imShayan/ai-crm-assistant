export async function generateSummary(customerId: number) {
  const response = await fetch("/api/summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customerId }),
  });
  const data = await response.json();
  if (data.success) {
    return data.summary;
  } else {
    throw new Error("Failed to generate summary");
  }
}

export async function fetchSummary(customerId: number) {
  const response = await fetch(`/api/summary?customerId=${customerId}`);
  const data = await response.json();
  if (data) {
    return data;
  } else {
    throw new Error("Failed to fetch summary");
  }
}