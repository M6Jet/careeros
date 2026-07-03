import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewRepoStructure } from "@/lib/github";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const { repo } = await req.json();
  const profile = await db.githubProfile.findUniqueOrThrow({ where: { userId: user.id } });
  const account = await db.account.findFirst({ where: { userId: user.id, provider: "github" } });
  const checks = await reviewRepoStructure(profile.username, repo, account?.access_token);
  return NextResponse.json({ checks, passed: checks.filter(c => c.ok).length });
}
