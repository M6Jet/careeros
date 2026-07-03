import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fetchGithubStats } from "@/lib/github";
import { encrypt, decrypt } from "@/lib/crypto";

// Connect GitHub with just a username (public data), or add a Personal Access
// Token for private repos + higher rate limits. No OAuth required.
export async function POST(req: NextRequest) {
  const user = await requireUser();
  const { username, token } = await req.json();
  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });
  const existing = await db.githubProfile.findUnique({ where: { userId: user.id } });
  const useToken = token || (existing?.accessToken ? decrypt(existing.accessToken) : null);
  try {
    const stats = await fetchGithubStats(username, useToken);
    const saved = await db.githubProfile.upsert({
      where: { userId: user.id },
      update: { username, stats, syncedAt: new Date(), ...(token ? { accessToken: encrypt(token) } : {}) },
      create: { userId: user.id, username, stats, syncedAt: new Date(), accessToken: token ? encrypt(token) : null },
    });
    return NextResponse.json({ ok: true, username: saved.username, stats });
  } catch {
    return NextResponse.json({ error: "GitHub fetch failed — check the username/token" }, { status: 502 });
  }
}
export async function GET() {
  const user = await requireUser();
  const profile = await db.githubProfile.findUnique({ where: { userId: user.id } });
  return NextResponse.json(profile ? { username: profile.username, stats: profile.stats, syncedAt: profile.syncedAt } : null);
}
