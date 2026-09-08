import { NextResponse } from "next/server";
import { addNote, getNotes } from "@/lib/services/note-db-service";
import { getCurrentServerUser } from "@/lib/services/server-auth-service";
import { getOwnedCustomer } from "@/lib/services/customer-authorization-service";

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
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  if (
    !isRecord(body) ||
    !isPositiveSafeInteger(body.customer_id) ||
    typeof body.note !== "string" ||
    body.note.trim() === ""
  ) {
    return NextResponse.json(
      { success: false, message: "customer_id and a non-empty note are required" },
      { status: 400 },
    );
  }

  const { customer, error } = await getOwnedCustomer(body.customer_id, user.id);
  if (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
  if (!customer) {
    return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
  }

  const newNote = await addNote({
    customer_id: body.customer_id,
    note: body.note.trim(),
    user_id: user.id,
  });

  if (!newNote) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    note: newNote,
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
    return NextResponse.json(
      { success: false, message: "Invalid customer ID" },
      { status: 400 },
    );
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

  return NextResponse.json({
    success: true,
    notes: notes,
  });
}