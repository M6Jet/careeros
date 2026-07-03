import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const user = await db.user.upsert({
    where: { email: "demo@careeros.dev" }, update: {},
    create: { email: "demo@careeros.dev", name: "Demo User", targetRole: "Backend Engineer" },
  });
  await db.job.createMany({ data: [
    { userId: user.id, company: "Stripe", role: "Backend Engineer", stage: "PHONE_SCREEN", salaryMin: 165000, salaryMax: 210000 },
    { userId: user.id, company: "Datadog", role: "Software Engineer", stage: "APPLIED" },
  ]});
  await db.certification.create({ data: { userId: user.id, name: "AWS Solutions Architect Associate", provider: "AWS", progress: 62 } });
  console.log("Seeded demo user:", user.email);
}
main().finally(() => db.$disconnect());
