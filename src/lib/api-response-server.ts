import { NextResponse } from "next/server";
import type { ApiFailure, ApiSuccess } from "./api-response";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status });
}

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json<ApiFailure>(
    { success: false, error: { code, message } },
    { status },
  );
}
