import {getNotes } from "../../../lib/services/note-db-service";
import { getCurrentServerUser } from "@/lib/services/server-auth-service";
import { generateSummary } from "@/lib/services/ai-service";
import { saveSummary } from "@/lib/services/summary-db-service";
import { NextResponse } from "next/server";
import {getSummary} from "@/lib/services/summary-db-service";

export async function POST(request: Request) {
    const body = await request.json();
    const user = await getCurrentServerUser();
    if (!user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const notes = await getNotes(body.customerId);

    const summaryText = await generateSummary(notes.map(note => note.note));
  
    const savedSummary = await saveSummary({
        customer_id: body.customerId,
        user_id: user.id,
        summary: summaryText
    });
  
    return NextResponse.json({
  success: true,
  summary: savedSummary,
});

}
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    if (!customerId) {
        return NextResponse.json({ success: false, message: "Customer ID is required" }, { status: 400 });
    }
    const summary = await getSummary(parseInt(customerId));
    if (!summary) {
        return NextResponse.json({ success: false, message: "Summary not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, summary });
};