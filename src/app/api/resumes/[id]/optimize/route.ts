import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { optimizeBullet, atsCheck, keywordMatch } from "@/lib/career";

// POST { action: "optimize" | "ats" | "tailor", jd?: string }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  const { action, jd } = await req.json();
  const resume = await db.resume.findFirstOrThrow({ where: { id: params.id, userId: user.id } });
  const sections = resume.sections as any;

  if (action === "ats") return NextResponse.json(atsCheck(sections));
  if (action === "tailor") return NextResponse.json(keywordMatch(jd ?? "", JSON.stringify(sections)));

  // optimize: snapshot then rewrite bullets
  await db.resumeVersion.create({ data: { resumeId: resume.id, snapshot: sections } });
  const report: any[] = [];
  for (const exp of sections.experience ?? []) {
    exp.bullets = (exp.bullets ?? []).map((b: string) => {
      const o = optimizeBullet(b);
      if (o.text !== b) report.push({ before: b, after: o.text, notes: o.notes });
      return o.text;
    });
  }
  await db.resume.update({ where: { id: resume.id }, data: { sections } });
  return NextResponse.json({ report, sections });
}
