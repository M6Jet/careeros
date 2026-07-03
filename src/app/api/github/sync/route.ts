import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fetchGithubStats } from "@/lib/github";
import { decrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const { username } = await req.json();
  // Prefer the OAuth token captured at GitHub SSO sign-in
  const account = await db.account.findFirst({ where: { userId: user.id, provider: "github" } });
  const profile = await db.githubProfile.findUnique({ where: { userId: user.id } });
  const token = account?.access_token ?? (profile?.accessToken ? decrypt(profile.accessToken) : null);
  const stats = await fetchGithubStats(username, token);
  const saved = await db.githubProfile.upsert({
    where: { userId: user.id },
    update: { username, stats, syncedAt: new Date() },
    create: { userId: user.id, username, stats, syncedAt: new Date() },
  });
  return NextResponse.json(saved);
}
