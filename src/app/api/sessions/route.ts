import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/crypto";

// Interview sessions — transcripts encrypted at rest.
export async function GET() {
  const user = await requireUser();
  const rows = await db.interviewSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows.map(r => ({ ...r, transcript: JSON.parse(decrypt(r.transcript as unknown as string)) })));
}
export async function POST(req: NextRequest) {
  const user = await requireUser();
  const { type, score, clarity, confidence, durationMin, transcript } = await req.json();
  const row = await db.interviewSession.create({
    data: { userId: user.id, type, score, clarity, confidence, durationMin,
      transcript: encrypt(JSON.stringify(transcript)) as any },
  });
  await db.activityDay.upsert({
    where: { userId_day: { userId: user.id, day: new Date(new Date().toDateString()) } },
    update: {}, create: { userId: user.id, day: new Date(new Date().toDateString()) },
  });
  return NextResponse.json(row, { status: 201 });
}
