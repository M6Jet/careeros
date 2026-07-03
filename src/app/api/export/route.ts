import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { buildContext } from "@/lib/coach";

// Full-account JSON export (backup). Import lives client-side against the CRUD APIs.
export async function GET() {
  const user = await requireUser();
  const ctx = await buildContext(user.id);
  return new NextResponse(JSON.stringify(ctx, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": "attachment; filename=careeros-backup.json" },
  });
}
