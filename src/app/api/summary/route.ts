import {getNotes } from "../../../lib/services/note-db-service";
import { getCurrentServerUser } from "@/lib/services/server-auth-service";
import { generateSummary } from "@/lib/services/ai-service";
import { saveSummary } from "@/lib/services/summary-db-service";
import { apiError, apiSuccess } from "@/lib/api-response-server";
import {getSummary} from "@/lib/services/summary-db-service";
import { getOwnedCustomer } from "@/lib/services/customer-authorization-service";

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

    const summaryText = await generateSummary(notes.map(note => note.note));
  
    const { data: savedSummary, error: summaryError } = await saveSummary({
        customer_id: customerId,
        user_id: user.id,
        summary: summaryText
    });

    if (summaryError || !savedSummary) {
        return apiError("DATABASE_ERROR", "Unable to save summary", 500);
    }
  
    return apiSuccess({ summary: savedSummary });

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

    const { data: summary, error: summaryError } = await getSummary(customerId, user.id);
    if (summaryError) {
        return apiError("DATABASE_ERROR", "Unable to load summary", 500);
    }
    if (!summary) {
        return apiError("NOT_FOUND", "Summary not found", 404);
    }
    return apiSuccess({ summary });
};