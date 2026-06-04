import { NextResponse } from "next/server";
import { addNote, getNotes } from "@/lib/services/note-db-service";
import { getCurrentServerUser } from "@/lib/services/server-auth-service";

export async function POST(request: Request) {
  const body = await request.json();

  const user = await getCurrentServerUser();

  if (!user) {
    return NextResponse.json(
      { success: false },
      { status: 401 }
    );
  }
  const newNote = await addNote({
    ...body,
    user_id: user.id,
  });

  return NextResponse.json({
    success: true,
    note: newNote,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json(
      { success: false, message: "Missing customerId" },
      { status: 400 }
    );
  }

  const notes = await getNotes(parseInt(customerId));
  return NextResponse.json({
    success: true,
    notes: notes,
  });
}