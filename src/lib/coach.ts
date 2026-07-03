// AI Career Coach. Uses Anthropic when ANTHROPIC_API_KEY is set;
// falls back to the deterministic rule-based engine otherwise.
import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { skillGap } from "./career";

export async function buildContext(userId: string) {
  const [user, resumes, jobs, certs, learning, sessions] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.resume.findMany({ where: { userId } }),
    db.job.findMany({ where: { userId }, include: { interviews: true } }),
    db.certification.findMany({ where: { userId } }),
    db.learningItem.findMany({ where: { userId } }),
    db.interviewSession.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const corpus = [JSON.stringify(resumes.map(r => r.sections)), learning.map(l => l.title).join(" "), certs.map(c => c.name).join(" ")].join(" ");
  const gap = skillGap(user!.targetRole, corpus);
  return { user: user!, resumes, jobs, certs, learning, sessions, gap };
}

export async function coachReply(userId: string, message: string): Promise<string> {
  const ctx = await buildContext(userId);
  if (process.env.ANTHROPIC_API_KEY) {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1000,
      system: `You are CareerOS's career coach. Be specific and actionable. User context:
Target: ${ctx.user.targetRole} in ${ctx.user.targetMonths} months.
Skill coverage ${ctx.gap.coverage}% — missing: ${ctx.gap.missing.join(", ") || "none"}.
Pipeline: ${ctx.jobs.map(j => `${j.company}(${j.stage})`).join(", ") || "empty"}.
Certs: ${ctx.certs.map(c => `${c.name} ${c.progress}%`).join(", ") || "none"}.
Learning: ${ctx.learning.map(l => `${l.title} ${l.done}/${l.total}`).join(", ") || "none"}.
Mock interviews: ${ctx.sessions.length}, avg ${avg(ctx.sessions.map(s => s.score))}.`,
      messages: [{ role: "user", content: message }],
    });
    return res.content.filter(b => b.type === "text").map((b: any) => b.text).join("");
  }
  return ruleBasedReply(message, ctx);
}

const avg = (ns: number[]) => (ns.length ? Math.round(ns.reduce((a, b) => a + b) / ns.length) : 0);

function ruleBasedReply(message: string, ctx: Awaited<ReturnType<typeof buildContext>>): string {
  const m = message.toLowerCase();
  const gaps = ctx.gap.missing.slice(0, 3).join(", ") || "none — full coverage";
  if (/study|learn|today|focus/.test(m))
    return `Today's plan toward ${ctx.user.targetRole}:\n1. 45 min on your top gap: ${ctx.gap.missing[0] ?? "advanced topics"}\n2. Continue your closest-to-done learning item\n3. One mock interview round (you've done ${ctx.sessions.length}, avg ${avg(ctx.sessions.map(s => s.score))}).`;
  if (/ready|google|faang/.test(m))
    return `Skill coverage ${ctx.gap.coverage}%, ${ctx.sessions.length} mock sessions (avg ${avg(ctx.sessions.map(s => s.score))}). Close these gaps first: ${gaps}. Target 10+ sessions averaging 75+ before top-tier onsites.`;
  if (/resume/.test(m))
    return `Run Optimize + ATS check in Resume Manager, then Tailor against a saved job description. Add missing keywords where truthful: ${gaps}.`;
  if (/skill|gap|senior/.test(m))
    return `Missing for ${ctx.user.targetRole}: ${gaps}. Covered: ${ctx.gap.have.slice(0, 5).join(", ")}. For senior scope: own a system end-to-end and document the trade-offs.`;
  return `I can see your full career context (coverage ${ctx.gap.coverage}%, ${ctx.jobs.length} tracked jobs). Ask about study plans, interview readiness, resume improvements, or skill gaps.`;
}
