# CareerOS — AI Career Operating System

AI-powered career management platform: resumes, job pipeline, interviews, learning,
certifications, networking CRM, GitHub analytics, and a context-aware AI coach.

## What's in this repo

| Layer | Status |
|---|---|
| **PostgreSQL data model** (`prisma/schema.prisma`) | ✅ Complete — all 9 modules + RBAC roles, automations, activity streaks |
| **API layer** (`src/app/api/*`) | ✅ CRUD for jobs/contacts/resumes/certs/learning/goals; AI resume optimize/ATS/tailor; coach; GitHub sync + code review; encrypted interview sessions; JSON export |
| **Auth / SSO** (`src/lib/auth.ts`) | ✅ NextAuth — Google + GitHub OAuth (GitHub token reused for repo analytics) |
| **Career intelligence** (`src/lib/career.ts`, `src/lib/coach.ts`) | ✅ Skill-gap engine, bullet optimizer, ATS checker, keyword match, coach (Anthropic API with rule-based fallback) |
| **Encryption at rest** (`src/lib/crypto.ts`) | ✅ AES-256-GCM for interview transcripts/notes |
| **Web UI** (`src/app/*/page.tsx`) | 🔶 Shell pages wired to auth — the full interactive UI ships in `standalone/CareerOS.html`; its vanilla-JS view logic ports 1:1 into React components |
| Mobile (React Native), push notifications, email digests | 📋 Planned — API layer is mobile-ready |

## Quick start

```bash
cp .env.example .env            # fill NEXTAUTH_SECRET + at least one OAuth provider
docker compose up -d            # local PostgreSQL
npm install
npx prisma db push              # create schema
npm run db:seed                 # demo data
npm run dev                     # http://localhost:3000
```

### AI coach
Set `ANTHROPIC_API_KEY` in `.env` for LLM-powered coaching. Without a key, the
deterministic rule-based engine (same logic as the standalone app) answers instead.

### GitHub integration
Sign in with GitHub (SSO) and the OAuth token is automatically reused for
repo analytics and AI code review — no separate connection step.

## Standalone build
`standalone/CareerOS.html` is a complete, zero-setup implementation of every module
(offline-first, localStorage persistence, Web Speech voice mode). Open it in any browser.

## Architecture notes
- **Offline & sync**: standalone build is offline-first; for the web app add a service
  worker + IndexedDB queue replaying against the CRUD APIs (all endpoints are idempotent PATCHes).
- **RBAC**: `User.role` (USER/MENTOR/COACH/ADMIN) — gate mentor read-access in `requireUser`.
- **Automations**: `Automation` table; triggers fire in the relevant route handlers
  (e.g., cert completion → resume skill append + LinkedIn task).
- **Plugin architecture**: add routes under `src/app/api/plugins/<name>` and register
  nav entries; all core intelligence is importable from `src/lib`.
