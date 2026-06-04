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
  console.log("Create Note Response:", response);

  return response.json();
}

export async function getNotes(customerId: number) {
  const response = await fetch(`/api/notes?customerId=${customerId}`);
  console.log("Get Notes Response:", response);
  return response.json();
}   