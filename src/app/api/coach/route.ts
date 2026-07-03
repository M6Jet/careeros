import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { coachReply } from "@/lib/coach";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const { message } = await req.json();
  await db.coachMessage.create({ data: { userId: user.id, role: "user", content: message } });
  const reply = await coachReply(user.id, message);
  await db.coachMessage.create({ data: { userId: user.id, role: "assistant", content: reply } });
  return NextResponse.json({ reply });
}
export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await db.coachMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }));
}
