import { addNote, getNotes } from "@/lib/services/note-db-service";
import { getCurrentServerUser } from "@/lib/services/server-auth-service";
import { getOwnedCustomer } from "@/lib/services/customer-authorization-service";
import { apiError, apiSuccess } from "@/lib/api-response-server";

function isPositiveSafeInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}

function parseCustomerId(value: string | null) {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const customerId = Number(value);
  return Number.isSafeInteger(customerId) && customerId > 0
    ? customerId
    : null;
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

  if (
    !isRecord(body) ||
    !isPositiveSafeInteger(body.customer_id) ||
    typeof body.note !== "string" ||
    body.note.trim() === ""
  ) {
    return apiError("VALIDATION_ERROR", "customer_id and a non-empty note are required", 400);
  }

  const { customer, error } = await getOwnedCustomer(body.customer_id, user.id);
  if (error) {
    return apiError("DATABASE_ERROR", "Unable to verify customer ownership", 500);
  }
  if (!customer) {
    return apiError("NOT_FOUND", "Customer not found", 404);
  }

  const { data: newNote, error: noteError } = await addNote({
    customer_id: body.customer_id,
    note: body.note.trim(),
    user_id: user.id,
  });

  if (noteError || !newNote) {
    return apiError("DATABASE_ERROR", "Unable to create note", 500);
  }

  return apiSuccess({ note: newNote });
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

  const { data: notes, error: notesError } = await getNotes(customerId, user.id);
  if (notesError || !notes) {
    return apiError("DATABASE_ERROR", "Unable to load notes", 500);
  }

  return apiSuccess({ notes });
}