import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  const items = await db.resume.findMany({ where: { userId: user.id } });
  return NextResponse.json(items);
}
export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = await req.json();
  const item = await db.resume.create({ data: { ...body, userId: user.id } });
  return NextResponse.json(item, { status: 201 });
}
