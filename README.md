# InterveneAI

A web app for teachers to manage students, log learning gaps, and track intervention plans.

Built as a full-stack assignment using Next.js, Prisma, and PostgreSQL.

## Features

- Sign up / sign in with email and password (NextAuth, JWT sessions, bcrypt-hashed passwords).
- Student CRUD, scoped to the logged-in teacher.
- Learning gap CRUD per student (subject, severity, status).
- Intervention plan CRUD per student (strategy, date range, status).
- Progress notes per plan (create, edit, delete).
- Dashboard with counts of students, open gaps, and active plans.
- Server-side ownership checks on every read and write.

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- PostgreSQL 16
- Prisma 6
- NextAuth v4 (Credentials provider)
- React Hook Form + Zod
- bcryptjs

## Demo credentials

After running the seed script:

- Email: `priya.sharma@interveneai.test`
- Password: `demo1234`

The demo teacher comes with a few students, gaps, plans, and notes pre-loaded so you can see the full UX without entering data yourself. You can also create a new account at `/auth/signup`.

## Local setup

### Requirements

- Node.js 20 or newer
- Docker (for the local Postgres container) or any reachable Postgres on TCP

### 1. Install dependencies

```bash
npm install
```

### 2. Start Postgres

```bash
npm run db:up
```

This starts Postgres 16 in Docker on `localhost:5433` (5433 to avoid clashing with any system-level Postgres on 5432). The script waits until the container reports healthy.

### 3. Configure environment

```bash
cp .env.example .env
```

The default `DATABASE_URL` matches the Docker container, so no edits are needed for local dev. Generate a real `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Paste that into `.env` as `NEXTAUTH_SECRET`. Leave `NEXTAUTH_URL="http://localhost:3000"`.

### 4. Run migrations

```bash
npm run prisma:migrate
```

When prompted, name the migration `init`. This generates the Prisma client and creates all tables.

### 5. Seed data

```bash
npm run db:seed
```

### 6. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

### Stopping / resetting

- Stop the DB: `npm run db:down`
- Wipe data and start over: `npm run db:reset`, then re-run steps 4 and 5.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `NEXTAUTH_SECRET` | Signs NextAuth session JWTs |
| `NEXTAUTH_URL` | Public origin of the app |

`.env.example` is checked in. `.env` is gitignored.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:up` | Start local Postgres |
| `npm run db:down` | Stop local Postgres |
| `npm run db:reset` | Wipe DB volume and restart |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Create and apply a dev migration |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed demo data |

## Routes

Public:

- `/` landing page
- `/auth/signup` create a teacher account
- `/auth/login` sign in

Protected (require sign-in):

- `/dashboard`
- `/dashboard/students`
- `/dashboard/students/new`
- `/dashboard/students/[id]`
- `/dashboard/students/[id]/edit`
- `/dashboard/students/[id]/gaps/new`
- `/dashboard/students/[id]/gaps/[gapId]/edit`
- `/dashboard/students/[id]/plans/new`
- `/dashboard/students/[id]/plans/[planId]`
- `/dashboard/students/[id]/plans/[planId]/edit`

API:

- `/api/auth/[...nextauth]`

All mutations live in server actions that sit next to the route they belong to (in `actions.ts` files).

## Project structure

```
prisma/
  schema.prisma         models, enums, relations
  seed.ts               demo data

src/
  app/
    api/auth/...        NextAuth handler
    auth/               sign-in and sign-up screens
    dashboard/          all protected routes
    page.tsx            landing page
  components/
    forms/              form components (RHF + Zod)
    layout/             landing page sections
    shared/             shared UI pieces
    students/, learning-gaps/, intervention-plans/, progress-notes/
  lib/
    auth.ts             NextAuth options
    auth-helpers.ts     ownership helpers
    prisma.ts           Prisma client singleton
    display/badges.ts   shared status labels and styles
    validators/         Zod schemas
  types/
    next-auth.d.ts      session and JWT type augmentation
```

## Deployment

The app is a standard Next.js server build (no static export).

1. Use a hosted Postgres provider (Supabase, Railway, RDS, etc.).
2. Add `prisma migrate deploy` to your build command, e.g. `"build": "prisma migrate deploy && next build"`.
3. Set the environment variables on your host:
   - `DATABASE_URL` with `?sslmode=require`
   - `NEXTAUTH_SECRET` (generate a fresh one for production)
   - `NEXTAUTH_URL` set to your deployed origin
4. After the first deploy, sign up through the app to create your first teacher account.

## License

Personal project.
