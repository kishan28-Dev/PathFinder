# CareerPath AI

> "Don't start learning from zero. Start from where you actually are."

CareerPath AI is a full-stack, AI-powered career and skill learning platform. It assesses
what a learner already knows, identifies the gap between that and a target career,
generates a personalized phased roadmap, and recommends real, verified free learning
resources — then tracks progress and lets the learner reassess and evolve their plan
over time.

This is a working application, not a static demo: real authentication, a real database,
a real AI pipeline with validation and guardrails, and persistent per-user state.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Folder Structure](#folder-structure)
5. [Environment Variables](#environment-variables)
6. [Setup](#setup)
7. [API Reference](#api-reference)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Security Notes](#security-notes)
11. [Known Limitations](#known-limitations)
12. [Future Improvements](#future-improvements)

---

## Features

- **Clerk authentication** — sign up, sign in, sessions, and protected routes on both
  the frontend and backend (the backend independently verifies every request; the
  frontend guard is a UX convenience, not the security boundary).
- **Guided onboarding** — education/experience, career goal (catalog or custom),
  current skills with self-rated levels, and learning preferences.
- **AI-generated assessments** — Groq generates a mixed-format quiz (multiple choice,
  code output, debugging, conceptual, scenario, short answer) calibrated to the
  learner's target career and self-reported skills.
- **Hybrid, reliable grading** — multiple-choice answers are graded deterministically
  in code (never by the AI); free-text answers are graded by Groq against an explicit
  rubric. This keeps the numeric scores trustworthy while still using AI for judgment
  calls that need it.
- **Skill gap analysis** — a deterministic (not AI-guessed) comparison of a career's
  required skills against the learner's assessed scores, classified 🟢 Strong /
  🟡 Needs Improvement / 🔴 Missing.
- **Personalized roadmaps** — Groq generates phases/topics/projects based on the
  learner's actual assessed level, then the backend attaches real, verified resources
  from MongoDB per phase (Groq ranks from a real candidate list — it never invents a
  resource, URL, or provider).
- **Progress tracking** — mark topics, resources, and projects complete; overall and
  per-phase progress, and a daily learning streak.
- **AI Career Mentor** — a chat interface with context about the learner's career,
  skill levels, current phase, and progress (never their raw personal data).
- **Reassessment** — retake the assessment and see skill-by-skill improvement against
  the previous attempt.
- **Career recommendation** — "What should I become?" flow for learners without a
  fixed goal, using AI to pick from the real career catalog (never inventing one).
- **Minimal admin surface** — role-gated CRUD for careers/skills/resources.

## Tech Stack

**Frontend:** React + Vite, React Router, Tailwind CSS, Lucide icons, Axios, Context API.
**Backend:** Node.js + Express, REST API, Mongoose/MongoDB.
**Auth:** Clerk (`@clerk/clerk-react` on the frontend, `@clerk/express` on the backend).
**AI:** Groq (`groq-sdk`), via a centralized service layer with schema-validated JSON
output (zod) and deterministic guardrails (see [Security Notes](#security-notes)).

## Architecture

```
Browser (React) ──axios──▶ Express API ──mongoose──▶ MongoDB
      │                         │
      │ Clerk session JWT       │ verifies JWT via @clerk/express
      ▼                         ▼
   Clerk (auth)            Groq (AI) — assessment gen/eval, roadmap gen, resource
                                        ranking, mentor chat, career recommendation
```

Key design decisions:

- **AI never invents facts it shouldn't.** Resource URLs, providers, and career names
  are always constrained to real records already in MongoDB — Groq ranks/selects from
  a provided list and any ID it returns that isn't in that list is discarded server-side.
- **Multiple-choice grading is deterministic**, not AI-judged — see
  `server/utils/gradeObjective.js`. Only free-text answer types go through Groq grading.
- **Skill-gap classification is deterministic**, not AI-judged — see
  `server/services/skillGapService.js`. Groq only adds qualitative narrative on top of
  already-computed numbers.
- **All AI JSON output is schema-validated** (`server/validators/aiSchemas.js`) with one
  retry before failing safely with a friendly error — a malformed AI response can never
  crash the server or get saved to the database.
- **Roadmaps are generated once and stored**, not regenerated on every dashboard load
  (see `POST /api/roadmap/generate` vs `GET /api/roadmap`).

## Folder Structure

```
careerpath-ai/
├── client/                  React + Vite frontend
│   ├── src/
│   │   ├── components/      common/, layout/, onboarding/, assessment/, roadmap/
│   │   ├── pages/            one file per route
│   │   ├── layouts/          AppLayout (sidebar + navbar shell)
│   │   ├── routes/           ProtectedRoute, OnboardingGate, AdminRoute
│   │   ├── context/          ProfileContext
│   │   ├── services/         one API client module per domain (careerApi.js, etc.)
│   │   ├── App.jsx / main.jsx
│   ├── package.json
│   └── .env.example
│
├── server/                  Express backend
│   ├── config/               db.js
│   ├── models/                Mongoose schemas
│   ├── controllers/           request/response handling only
│   ├── services/              business logic (groqService, roadmapService, ...)
│   ├── prompts/                centralized Groq prompt templates
│   ├── validators/             zod schemas for request bodies AND AI JSON output
│   ├── middleware/             auth, error handling, rate limiting, validation
│   ├── routes/
│   ├── seed/                   real, verified seed data + runner
│   ├── tests/                  node:test unit tests
│   ├── app.js / server.js
│   ├── package.json
│   └── .env.example
│
├── README.md
├── .gitignore
└── package.json              convenience scripts to run both apps together
```

## Environment Variables

### `server/.env` (copy from `server/.env.example`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `CLERK_SECRET_KEY` | Clerk backend secret key |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (backend also needs this) |
| `GROQ_API_KEY` | Groq API key — **backend only, never exposed to the client** |
| `GROQ_MODEL` | Groq model id (default `openai/gpt-oss-120b`; change here if Groq deprecates a model — see console.groq.com/docs/deprecations) |
| `CLIENT_URL` | Frontend origin, for CORS |
| `PORT` | API port (default `5000`) |

### `client/.env` (copy from `client/.env.example`)

| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_API_URL` | Backend API base URL, e.g. `http://localhost:5000/api` |

**The Groq key must never appear in any `VITE_*` variable or anywhere in `client/`.**

## Setup

### 1. Prerequisites

- Node.js 18+
- A MongoDB instance (local `mongod` or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Clerk](https://clerk.com) application (free tier is fine)
- A [Groq](https://console.groq.com) API key (free tier is fine)

### 2. Install dependencies

```bash
npm run install:all
# or individually:
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in the values described above.

**Clerk setup:** create an application at dashboard.clerk.com, copy the Publishable Key
and Secret Key into the two `.env` files. No further configuration is required — email/
password and social sign-in both work out of the box.

**Groq setup:** create a key at console.groq.com/keys and put it in `server/.env` only.

### 4. Seed the database

```bash
cd server && npm run seed
```

This populates real careers, skills, and verified free resources — required before
onboarding/assessment/roadmap flows will work.

### 5. Run the app

```bash
# from the repo root, runs both apps concurrently
npm run dev

# or separately:
cd server && npm run dev     # http://localhost:5000
cd client && npm run dev     # http://localhost:5173
```

Visit `http://localhost:5173`.

### First admin user

There's no self-service admin signup (by design — see Security Notes). After signing
up once, promote yourself directly in MongoDB:

```js
db.userprofiles.updateOne({ clerkId: "your_clerk_user_id" }, { $set: { role: "admin" } })
```

## API Reference

All responses follow `{ success: true, data }` or `{ success: false, message }`.
Endpoints under `/api` other than `/api/careers` and `/api/skills` require a valid
Clerk session (`Authorization: Bearer <token>`).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/me` | Confirms session, returns onboarding status |
| GET/PUT | `/api/profile` | Get/update the learner's profile |
| GET | `/api/careers` | List careers (public) |
| GET | `/api/careers/:slug` | Career detail (public) |
| POST | `/api/careers/recommend` | AI career recommendation from real catalog |
| GET | `/api/skills` | List skills (public) |
| POST | `/api/assessment/generate` | Generate a new AI assessment |
| POST | `/api/assessment/submit` | Submit answers, get graded results + skill gap |
| GET | `/api/assessment/history` | Past assessment results |
| GET | `/api/assessment/:id` | One assessment's questions |
| POST | `/api/roadmap/generate` | Generate (or regenerate) the personalized roadmap |
| GET | `/api/roadmap` | Get the active roadmap |
| PUT | `/api/roadmap/progress` | Toggle a topic/resource/project complete |
| GET | `/api/resources` | Browse the resource catalog (filterable) |
| GET | `/api/resources/recommended` | Best resources for current skill gaps |
| POST | `/api/mentor/chat` | Ask the AI mentor a question |
| GET | `/api/mentor/history` | Mentor chat history |
| GET/PUT | `/api/progress` | Get/update aggregate progress |
| * | `/api/admin/*` | Admin-only CRUD for careers/skills/resources (role: `admin`) |

## Testing

```bash
cd server && npm test
```

28 unit tests cover the logic where correctness matters most and is cheapest to
verify in isolation: deterministic MCQ grading, skill-score aggregation, skill-gap
classification, roadmap progress/phase-status computation, streak logic, and the
`requireAdmin` authorization guard.

AI-dependent flows (assessment generation/evaluation, roadmap generation, resource
ranking, mentor chat) require a live Groq key and are best verified manually end-to-end
once real credentials are configured — they're integration behavior, not unit-testable
in isolation without mocking the model's output.

## Deployment

- **Frontend (Vercel):** set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` (pointing
  at your deployed backend) as project environment variables. Build command `npm run
  build` from `client/`, output directory `dist`.
- **Backend (Render/Railway):** set all `server/.env` variables as environment
  variables. Start command `node server.js`. Set `CLIENT_URL` to your deployed
  frontend origin for CORS.
- **Database (MongoDB Atlas):** create a cluster, whitelist your backend's IP (or
  `0.0.0.0/0` for simplicity on a demo), and use the connection string as `MONGODB_URI`.

No URLs are hardcoded — `CLIENT_URL`, `VITE_API_URL`, and `MONGODB_URI` are all
environment-driven.

## Security Notes

- Passwords are never handled or stored by this application — Clerk owns all
  credential storage and session management.
- The Groq API key exists only in `server/.env` and is read only by
  `server/services/groqClient.js`. It is never sent to, or reachable from, the client.
- Every protected API route independently verifies the Clerk session server-side
  (`middleware/auth.js`) — the frontend's route guards are a UX layer, not the trust
  boundary.
- AI/Groq-backed endpoints have a stricter rate limit (`middleware/rateLimiter.js`)
  than the rest of the API to control cost and abuse.
- All request bodies are validated with zod before reaching a controller
  (`middleware/validate.js`, `validators/`).
- Helmet + CORS are configured; errors are logged server-side but only a generic,
  safe message is ever sent to the client (`middleware/errorHandler.js`).
- Admin access is role-gated (`UserProfile.role`) and provisioned manually in the
  database rather than through a self-service UI, to avoid a privilege-escalation
  surface in the MVP.

## Known Limitations

- **The verified resource catalog only covers the 9 seeded careers.** A custom
  ("something else") career goal has no `requiredSkills` and can name arbitrary,
  off-catalog skills. When no verified resource exists for a skill, the app falls back
  to AI-generated *search guidance* (what to search for, what to look for) instead of
  a resource card — it never fabricates a URL or provider to fill the gap. See
  `generateResourceGuidance()` in `groqService.js` and `ResourceGuidanceCard` on the
  frontend, clearly labeled "AI suggestion — not a verified link". The real fix for
  broad coverage is growing `server/seed/data.skills.js` / `data.resources.js`.
- **Resources are attached per phase, not per individual topic.** The spec's ideal is
  a "best resource" per topic; given the number of Groq calls that would require, this
  MVP ranks resources against the 1-2 primary skills of each phase instead. The data
  model (`Roadmap.phases[].resources[]`) supports finer granularity if extended later.
- **Adaptive difficulty is structural, not sequential.** Assessments are generated as
  one calibrated batch (difficulty matched to self-reported level) rather than
  adjusting question-by-question in real time, per the MVP allowance in the spec. The
  question schema and grading pipeline are already shaped to support true per-question
  adaptivity later.
- **Admin UI is functional but minimal** — list/create/delete, no inline edit-in-place
  or bulk tools.
- **No automated end-to-end tests for AI-dependent flows** (requires a live Groq key
  and is nondeterministic by nature); covered by manual testing guidance above instead.

## Future Improvements

- True per-question adaptive difficulty during the assessment itself.
- Per-topic (not just per-phase) resource attachment.
- Richer admin UI (inline editing, resource health checks for dead links).
- Notifications/reminders to protect learning streaks.
- Social/portfolio features (share a completed roadmap or project).
