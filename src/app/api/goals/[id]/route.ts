import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

type P = { params: { id: string } };
export async function PATCH(req: NextRequest, { params }: P) {
  const user = await requireUser();
  const body = await req.json();
  const item = await db.goal.update({ where: { id: params.id, userId: user.id }, data: body });
  return NextResponse.json(item);
}
export async function DELETE(_: NextRequest, { params }: P) {
  const user = await requireUser();
  await db.goal.delete({ where: { id: params.id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
