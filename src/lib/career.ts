// Core career intelligence — shared by API routes and the AI coach.
export const ROLE_SKILLS: Record<string, string[]> = {
  "Backend Engineer": ["API design","SQL / PostgreSQL","System design","Caching (Redis)","Message queues","Docker","Kubernetes","Testing","Observability","Cloud (AWS/GCP)","Data structures & algorithms","Auth / security"],
  "Frontend Engineer": ["React","TypeScript","CSS","State management","Testing","Accessibility","Performance","Build tooling","REST/GraphQL","Design systems"],
  "Full-Stack Engineer": ["React","Node.js","TypeScript","SQL","API design","Testing","Docker","Cloud","CI/CD","System design"],
  "DevOps Engineer": ["Linux","Docker","Kubernetes","Terraform","CI/CD","Cloud","Monitoring","Scripting","Networking","Security"],
  "Data Engineer": ["SQL","Python","ETL","Spark","Airflow","Warehousing","Streaming","Cloud data","Data modeling","dbt"],
  "ML Engineer": ["Python","PyTorch/TensorFlow","ML fundamentals","Pipelines","Deployment","SQL","Cloud ML","Experiments","Statistics","LLMs"],
};
export const SALARY_BANDS: Record<string, [number, number, number]> = {
  "Backend Engineer": [95, 135, 175], "Frontend Engineer": [90, 130, 165],
  "Full-Stack Engineer": [92, 132, 170], "DevOps Engineer": [100, 140, 180],
  "Data Engineer": [100, 140, 180], "ML Engineer": [115, 155, 200],
};

export function skillGap(role: string, corpus: string) {
  const need = ROLE_SKILLS[role] ?? ROLE_SKILLS["Backend Engineer"];
  const text = corpus.toLowerCase();
  const have: string[] = [], missing: string[] = [];
  for (const sk of need) {
    const keys = sk.toLowerCase().split(/[\/()]/).map(s => s.trim()).filter(s => s.length > 2);
    (keys.some(k => text.includes(k)) ? have : missing).push(sk);
  }
  return { have, missing, coverage: Math.round((100 * have.length) / need.length) };
}

const WEAK_OPENERS: Record<string, string> = {
  "responsible for": "Owned", "worked on": "Delivered", "helped": "Drove",
  "was involved in": "Led", "assisted": "Supported", "participated in": "Contributed to",
};
export function optimizeBullet(b: string) {
  let text = b.trim(); const notes: string[] = [];
  for (const [weak, strong] of Object.entries(WEAK_OPENERS)) {
    const re = new RegExp("^" + weak, "i");
    if (re.test(text)) { text = text.replace(re, strong); notes.push(`Replaced "${weak}" with "${strong}"`); break; }
  }
  if (!/\d/.test(text)) { notes.push("Add a metric to show impact"); text += " — [quantify impact]"; }
  return { text: text[0].toUpperCase() + text.slice(1), notes };
}

export function atsCheck(sections: any) {
  const bullets: string[] = (sections.experience ?? []).flatMap((e: any) => e.bullets ?? []);
  const checks = [
    { label: "Professional summary present", ok: !!sections.summary },
    { label: "8+ skills listed", ok: (sections.skills ?? "").split(",").length >= 8 },
    { label: "All roles dated", ok: (sections.experience ?? []).every((e: any) => e.dates) },
    { label: "Majority of bullets quantified", ok: bullets.filter(b => /\d/.test(b)).length >= bullets.length / 2 },
    { label: "No overlong bullets", ok: !bullets.some(b => b.length > 220) },
    { label: "Education present", ok: !!sections.education },
  ];
  return { checks, passed: checks.filter(c => c.ok).length };
}

export function keywordMatch(jd: string, resumeText: string) {
  const stop = new Set("the a an and or of to in for with on at by is are be will you our we as that this from".split(" "));
  const freq: Record<string, number> = {};
  for (const wd of jd.toLowerCase().match(/[a-z][a-z+#.\-]{2,}/g) ?? []) if (!stop.has(wd)) freq[wd] = (freq[wd] ?? 0) + 1;
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 18).map(x => x[0]);
  const rt = resumeText.toLowerCase();
  const matched = top.filter(k => rt.includes(k)), missing = top.filter(k => !rt.includes(k));
  return { matched, missing, score: top.length ? Math.round((100 * matched.length) / top.length) : 0 };
}
