export async function generateSummary(notes: string[]) {
  console.log("8Generating summary for notes:", notes);
  return `
    Lead appears interested.
    Follow-up recommended.
    Customer discussed pricing.
  `;
}

export async function generateRecommendation(notes: string[]) {
  return `
1. Schedule product demo
2. Send pricing sheet
3. Follow up within 3 days
`;
}
