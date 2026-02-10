# Technical documentation — Epitrello

Practical project documentation: stack, setup, structure, API and conventions.

---

## 1. Overview

**Epitrello** is a Kanban-style application (boards → lists → cards) with authentication.

- **Stack**: Nuxt 4, Vue 3, Nuxt UI, Prisma, PostgreSQL, better-auth, Zod, driver.js (tour guide), vue3-smooth-dnd (drag & drop).
- **Auth**: better-auth (email/password, sessions, Prisma adapter).
- **UI**: Nuxt UI 4, Epitech theme (primary color), dashboard layout for protected pages.

---

## 2. Prerequisites and environment variables

- **Node**: version supported by Nuxt 4 (LTS recommended).
- **pnpm**: package manager used (`packageManager` in `package.json`).
- **PostgreSQL**: database.

Expected variables (e.g. in `.env` at project root):

| Variable         | Description                    |
|------------------|--------------------------------|
| `DATABASE_URL`   | PostgreSQL connection URL      |

Example: `DATABASE_URL="postgresql://user:password@localhost:5432/epitrello"`

---

## 3. Setup and commands

```bash
# Install dependencies
pnpm install

# Generate Prisma client (also runs on postinstall)
pnpm db:generate

# Apply schema to database (no versioned migrations)
pnpm db:push

# Start dev server
pnpm dev
```

Other useful commands:

| Command           | Purpose                                      |
|-------------------|----------------------------------------------|
| `pnpm build`      | Production build                             |
| `pnpm preview`     | Preview production build                     |
| `pnpm typecheck`   | TypeScript check                             |
| `pnpm lint`        | Check formatting (Prettier)                  |
| `pnpm lint:fix`    | Fix formatting                               |
| `pnpm test`        | Run tests (Vitest)                            |
| `pnpm auth:schema` | Generate better-auth schema if needed         |

---

## 4. Project structure

```
├── app/
│   ├── assets/css/       # Global styles (main.css, tour theme)
│   ├── components/      # Reusable Vue components
│   ├── composables/     # useAuth, usePageTitle, useTour
│   ├── layouts/         # default, dashboard
│   ├── middleware/      # auth.global.ts (route protection)
│   ├── pages/            # File-based routes (Nuxt)
│   ├── plugins/         # driver.client.ts, auth client/server
│   └── utils/           # Helpers (getColors, etc.)
├── server/
│   ├── api/             # API handlers (see § 6)
│   └── utils/           # auth.ts (better-auth + Prisma), schema.ts (Zod)
├── prisma/
│   ├── schema.prisma    # Models and enums
│   └── generated/       # Generated Prisma client
├── docs/
│   └── TECHNICAL.md     # This file
├── nuxt.config.ts
├── prisma.config.ts     # Prisma config (DATABASE_URL)
└── package.json
```

---

## 5. Authentication

- **Backend**: `server/utils/auth.ts` — better-auth with Prisma adapter (PostgreSQL), `emailAndPassword: true`, additional fields `firstname` / `lastname`.
- **Client**: `app/composables/auth.ts` — `useAuth()` exposes `user`, `session`, `loggedIn`, `signIn`, `signUp`, `signOut`, `fetchSession`, `options`.
- **Middleware**: `app/middleware/auth.global.ts` — applied to all routes unless `meta.auth === false` or `meta.auth.only === 'guest'`.
  - Options: `only: 'guest' | 'user'`, `redirectUserTo`, `redirectGuestTo`.
  - Default: not logged in → redirect to `redirectGuestTo` (e.g. `/login`).
- **Auth routes**: proxied to better-auth via `server/api/auth/[...all].ts`.

Example page meta:

```ts
definePageMeta({
  layout: 'dashboard',
  auth: false                    // no redirect
  // or auth: { only: 'guest', redirectUserTo: '/boards' }
})
```

---

## 6. API (server/api)

Handler conventions:

1. Get session: `const session = await auth.api.getSession(event)`.
2. If no session: `throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })`.
3. For request body: `readValidatedBody(event, MySchema.safeParse)` then on error return `422` with Zod issues.
4. Ensure the resource belongs to the user (e.g. `ownerId: session.user.id` or relation via `list.board.ownerId`).

### Main endpoints

| Method | Route | Description |
|--------|--------|-------------|
| GET    | `/api/boards` | List user's boards |
| POST   | `/api/boards` | Create a board (body: `{ name }`) |
| GET    | `/api/boards/:id` | Board detail + lists + cards + labels |
| PATCH  | `/api/boards/:id` | Update a board |
| DELETE | `/api/boards/:id` | Delete a board |
| GET    | `/api/boards/:id/lists` | Board lists |
| POST   | `/api/boards/:id/lists` | Create a list (body: `title`, `position`, `color?`) |
| PATCH  | `/api/lists/:id` | Update a list (e.g. `position`, `boardId`) |
| DELETE | `/api/lists/:id` | Delete a list |
| POST   | `/api/cards` | Create a card (body: `title`, `listId`, `position`, etc.) |
| GET    | `/api/cards/:id` | Card detail |
| PATCH  | `/api/cards/:id` | Update a card (list, position, labels, dates, …) |
| DELETE | `/api/cards/:id` | Delete a card |
| POST   | `/api/boards/:id/labels` | Create a label |
| GET    | `/api/boards/:id/labels` | Board labels |
| PATCH  | `/api/labels/:id` | Update a label |
| DELETE | `/api/labels/:id` | Delete a label |
| POST   | `/api/cards/:id/labels/:labelId` | Attach label to card |
| DELETE | `/api/cards/:id/labels/:labelId` | Detach label |
| POST   | `/api/upload` | Upload (e.g. Vercel Blob) |
| *      | `/api/auth/[...all]` | better-auth proxy |

Zod schemas live in `server/utils/schema.ts`: `BoardInputSchema`, `ListInputSchema`, `CardInputSchema`, `LabelInputSchema`.

---

## 7. Database (Prisma)

- **Provider**: PostgreSQL.
- **Client**: generated in `prisma/generated` (alias `@@/prisma/generated/client` on server).

Main models:

- **User**: id, name, email, image, firstname, lastname — related to Session, Account, Board.
- **Board**: id, name, ownerId → User; relations List[], Label[].
- **List**: id, title, position, color (enum), boardId → Board; relation Card[].
- **Card**: id, title, description, position, startDate, dueDate, listId → List; relation Label[] (M:N).
- **Label**: id, name, color (hex), boardId → Board; relation Card[] (M:N).

**Color** enum: GRAY, RED, YELLOW, GREEN, SKY, BLUE, VIOLET, PINK.

To create/update schema in dev: `pnpm db:push`. For versioned migrations, configure Prisma accordingly.

---

## 8. Frontend (app)

- **Layouts**: `default` (landing, header), `dashboard` (sidebar + navbar, used for /boards, /boards/:id, /settings).
- **Pages**: file-based routing under `app/pages/` (index, login, sign-up, boards, boards/[id], boards/[id]/cards/[cardId], settings).
- **Composables**: `useAuth()`, `usePageTitle()`, `useTour()` (driver.js tour guide).
- **Tour guide**: steps defined in `useTour.ts` for `/boards` and `/boards/[id]`, triggered by `TourTrigger` component; `data-tour="..."` attributes on target elements.
- **Drag & drop**: `vue3-smooth-dnd` on the board page for lists and cards; positions updated via PATCH list/card.

---

## 9. Configuration and theme

- **Nuxt**: `nuxt.config.ts` — modules `@nuxt/test-utils`, `@nuxt/ui`; CSS `~/assets/css/main.css`.
- **UI**: `app/app.config.ts` — colors (primary: epitech, neutral: slate, error: rose), Phosphor icons (`i-ph-*`).
- **Prisma**: `prisma.config.ts` — `schema`, `migrations`, `datasource.url` via `env('DATABASE_URL')`.

---

## 10. Deployment (Vercel and Prisma Data Platform)

The application is designed to be deployed on **Vercel** with the database hosted on **Prisma Data Platform** (PostgreSQL).

### Vercel

- **Hosting**: The Nuxt app is deployed as a serverless application on Vercel. Connect the Git repository to Vercel; the build command is `pnpm build` (or `nuxt build`), with `pnpm install` for dependencies.
- **Environment**: Set `DATABASE_URL` (and any other secrets) in the Vercel project settings (Environment Variables). Use the same variable for Production, Preview, and optionally Development if you use Vercel for local env.
- **Server API**: `server/api/` routes run as Vercel serverless functions; no extra configuration is required for Nuxt.
- **Storage**: Uploads use **Vercel Blob** (`@vercel/blob`) in `server/api/upload.post.ts`; configure the Blob store in the Vercel project and set the required env vars (e.g. `BLOB_READ_WRITE_TOKEN` if used).

### Prisma Data Platform

- **Database**: PostgreSQL is provisioned and managed via [Prisma Data Platform](https://prisma.io/data-platform). Create a project, provision a database, and copy the connection string.
- **Connection**: Use the provided connection URL as `DATABASE_URL`. The project uses the Prisma **Pg** driver adapter (`@prisma/adapter-pg`) with the `pg` package, which is compatible with Prisma Data Platform’s PostgreSQL.
- **Schema**: Apply the schema with `pnpm db:push` (or via CI/deploy scripts). For production, you can run migrations or `db:push` as part of your deployment or in a separate step with a dedicated script.

---

## 11. CI/CD and quality gates

### Git hooks (Husky + Commitlint)

- **Husky** runs Git hooks. After `pnpm install`, the `prepare` script runs `husky` to install them.
- **Commit message (Commitlint)**  
  - Hook: `.husky/commit-msg` runs `commitlint --edit $1`.  
  - Config: `.commitlintrc.json` extends `@commitlint/config-conventional`.  
  - Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) format (e.g. `feat: add board filters`, `fix: card drag on mobile`). Invalid messages cause the commit to be rejected.
- **Pre-commit**  
  - Hook: `.husky/pre-commit` runs `lint-staged`.  
  - Only staged files are checked. This typically runs formatting (e.g. Prettier) and optionally lint, so code is formatted and linted before each commit.

### Linting

- **Formatting**: `pnpm lint` runs Prettier in check mode; `pnpm lint:fix` applies fixes. Use these in CI to enforce style.
- **TypeScript**: `pnpm typecheck` runs `nuxt typecheck`. Recommended in CI to catch type errors before merge.

### Vercel preview deployments

- **Per-branch previews**: For each push to a branch (e.g. `feat/xxx`, `fix/yyy`), Vercel automatically builds and deploys a **Preview** URL. The main branch usually maps to **Production**.
- **Usage**: Share the Preview link from the Vercel dashboard or from the PR to test changes before merging. Ensure `DATABASE_URL` (and other env vars) are set for Preview environments if the preview app must use a real database (e.g. a shared staging DB or a branch-specific DB).

---

## 12. Conventions and practices

- **Validation**: Zod for all API bodies via `readValidatedBody` and schemas in `server/utils/schema.ts`.
- **Auth**: session checked in every protected handler; ownership verified (ownerId or board.ownerId relation).
- **IDs**: generated on server with `generateId()` (better-auth) for Board, List, Card, Label.
- **Position**: Float for lists/cards; reorder logic (gap, midpoint between positions) on the board page.
- **Format**: Prettier; commits and pre-commit checks are enforced via Husky + Commitlint + lint-staged (see § 11).

---

## 13. Quick troubleshooting

- **Prisma error / "can't find module"**: run `pnpm db:generate` (or `pnpm install`, which runs `prisma generate`).
- **401 on API**: ensure the user is logged in and cookies are sent (same origin, credentials).
- **DATABASE_URL**: must be set at build and runtime (server); not required on client.
- **Tour guide**: only available on `/boards` and `/boards/:id`; click the "?" button in the navbar to run it again.

To expand a section (e.g. exact Zod schemas, fields per API), add it to this doc or to separate files (e.g. `docs/API.md`, `docs/SCHEMA.md`).
