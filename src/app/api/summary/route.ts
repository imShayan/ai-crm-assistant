import {getNotes } from "../../../lib/services/note-db-service";
import { getCurrentServerUser } from "@/lib/services/server-auth-service";
import { generateSummary } from "@/lib/services/ai-service";
import { saveSummary } from "@/lib/services/summary-db-service";
import { NextResponse } from "next/server";
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
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ success: false, message: "Request body must be valid JSON" }, { status: 400 });
    }

    const customerId = isRecord(body) ? parseCustomerId(body.customerId) : null;
    if (!customerId) {
        return NextResponse.json({ success: false, message: "Invalid customer ID" }, { status: 400 });
    }

    const { customer, error } = await getOwnedCustomer(customerId, user.id);
    if (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
    if (!customer) {
        return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    const { notes, error: notesError } = await getNotes(customerId, user.id);
    if (notesError) {
        return NextResponse.json({ success: false }, { status: 500 });
    }

    const summaryText = await generateSummary(notes.map(note => note.note));
  
    const savedSummary = await saveSummary({
        customer_id: customerId,
        user_id: user.id,
        summary: summaryText
    });

    if (!savedSummary) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
  
    return NextResponse.json({
  success: true,
  summary: savedSummary,
});

}
export async function GET(request: Request) {
    const user = await getCurrentServerUser();
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = parseCustomerId(searchParams.get("customerId"));
    if (!customerId) {
        return NextResponse.json({ success: false, message: "Invalid customer ID" }, { status: 400 });
    }

    const { customer, error } = await getOwnedCustomer(customerId, user.id);
    if (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
    if (!customer) {
        return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    const { summary, error: summaryError } = await getSummary(customerId, user.id);
    if (summaryError) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
    if (!summary) {
        return NextResponse.json({ success: false, message: "Summary not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, summary });
};