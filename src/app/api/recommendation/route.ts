import { NextResponse } from "next/server";

import {
  saveRecommendation,
  getRecommendation,
} from "../../../lib/services/recommendations-db-service";

import { generateRecommendation } from "@/lib/services/ai-service";

import { getCurrentServerUser } from "@/lib/services/server-auth-service";

import { getNotes } from "@/lib/services/note-db-service";

export async function POST(request: Request) {
  const body = await request.json();

  const user = await getCurrentServerUser();

  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const notes = await getNotes(body.customerId);

  const recommendationText = await generateRecommendation(
    notes.map((note) => note.note),
  );
  console.log("Generated Recommendation Text:", recommendationText);
  const savedRecommendation = await saveRecommendation({
    customer_id: body.customerId,
    user_id: user.id,
    recommendation: recommendationText,
  });

  return NextResponse.json({
    success: true,
    recommendation: savedRecommendation,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const customerId = searchParams.get("customerId");

  const recommendation = await getRecommendation(Number(customerId));

  if (!recommendation) {
    return NextResponse.json(
      {
        success: false,
        message: "Recommendation not found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    recommendation,
  });
}
