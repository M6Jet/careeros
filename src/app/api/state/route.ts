import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

async function getUser() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return db.user.findUnique({ where: { email } });
}
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const st = await db.userState.findUnique({ where: { userId: user.id } });
  return NextResponse.json(st?.data ?? null);
}
export async function PUT(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = await req.json();
  await db.userState.upsert({
    where: { userId: user.id },
    update: { data },
    create: { userId: user.id, data },
  });
  return NextResponse.json({ ok: true });
}
