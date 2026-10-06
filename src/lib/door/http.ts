import { NextResponse } from "next/server";
import { HttpError } from "./session";

export function jsonError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Request failed";
  const status = /unauthorized|invalid password|no user found/i.test(message) ? 401 : 500;
  console.error(error);
  return NextResponse.json({ error: message }, { status });
}
