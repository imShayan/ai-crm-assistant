import {
  saveRecommendation,
  getRecommendation,
} from "../../../lib/services/recommendations-db-service";

import { generateRecommendation } from "@/lib/services/ai-service";

import { getCurrentServerUser } from "@/lib/services/server-auth-service";

import { getNotes } from "@/lib/services/note-db-service";
import { getOwnedCustomer } from "@/lib/services/customer-authorization-service";
import { apiError, apiSuccess } from "@/lib/api-response-server";

function parseCustomerId(value: unknown) {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !/^\d+$/.test(value))
  ) {
    return null;
  }

  const customerId = Number(value);
  return Number.isSafeInteger(customerId) && customerId > 0 ? customerId : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const user = await getCurrentServerUser();
  if (!user) {
    return apiError("UNAUTHORIZED", "Unauthorized", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("VALIDATION_ERROR", "Request body must be valid JSON", 400);
  }

  const customerId = isRecord(body) ? parseCustomerId(body.customerId) : null;
  if (!customerId) {
    return apiError("VALIDATION_ERROR", "Invalid customer ID", 400);
  }

  const { customer, error } = await getOwnedCustomer(customerId, user.id);
  if (error) {
    return apiError("DATABASE_ERROR", "Unable to verify customer ownership", 500);
  }
  if (!customer) {
    return apiError("NOT_FOUND", "Customer not found", 404);
  }

  const { data: notes, error: notesError } = await getNotes(customerId, user.id);
  if (notesError || !notes) {
    return apiError("DATABASE_ERROR", "Unable to load notes", 500);
  }

  const recommendationText = await generateRecommendation(
    notes.map((note) => note.note),
  );

  const { data: savedRecommendation, error: recommendationError } = await saveRecommendation({
    customer_id: customerId,
    user_id: user.id,
    recommendation: recommendationText,
  });

  if (recommendationError || !savedRecommendation) {
    return apiError("DATABASE_ERROR", "Unable to save recommendation", 500);
  }

  return apiSuccess({ recommendation: savedRecommendation });
}

export async function GET(request: Request) {
  const user = await getCurrentServerUser();
  if (!user) {
    return apiError("UNAUTHORIZED", "Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);

  const customerId = parseCustomerId(searchParams.get("customerId"));
  if (!customerId) {
    return apiError("VALIDATION_ERROR", "Invalid customer ID", 400);
  }

  const { customer, error } = await getOwnedCustomer(customerId, user.id);
  if (error) {
    return apiError("DATABASE_ERROR", "Unable to verify customer ownership", 500);
  }
  if (!customer) {
    return apiError("NOT_FOUND", "Customer not found", 404);
  }

  const { data: recommendation, error: recommendationError } = await getRecommendation(
    customerId,
    user.id,
  );
  if (recommendationError) {
    return apiError("DATABASE_ERROR", "Unable to load recommendation", 500);
  }

  if (!recommendation) {
    return apiError("NOT_FOUND", "Recommendation not found", 404);
  }

  return apiSuccess({ recommendation });
}
