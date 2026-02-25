# JS Monorepo Template

A full-stack TypeScript monorepo — React + Vite frontend, Express 5 backend, JWT auth out of the box.

## Stack

### Backend (`apps/api`)

|                                                                                |                          |
| ------------------------------------------------------------------------------ | ------------------------ |
| [Express 5](https://expressjs.com/)                                            | HTTP server              |
| [Drizzle ORM](https://orm.drizzle.team/)                                       | Type-safe ORM            |
| [PostgreSQL](https://www.postgresql.org/)                                      | Database                 |
| [Zod](https://zod.dev/)                                                        | Request validation       |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)                     | JWT access tokens        |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js)                               | Password hashing         |
| [Helmet](https://helmetjs.github.io/)                                          | Security headers         |
| [CORS](https://github.com/expressjs/cors)                                      | Cross-origin requests    |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | Auth route rate limiting |
| [Vitest](https://vitest.dev/)                                                  | Testing                  |

### Frontend (`apps/web`)

|                                                                                 |                         |
| ------------------------------------------------------------------------------- | ----------------------- |
| [React 19](https://react.dev/)                                                  | UI framework            |
| [Vite 7](https://vite.dev/)                                                     | Build tool + dev server |
| [React Router 7](https://reactrouter.com/)                                      | Client-side routing     |
| [Tailwind CSS 4](https://tailwindcss.com/)                                      | Styling                 |
| [shadcn/ui](https://ui.shadcn.com/)                                             | Component library       |
| [Zustand](https://zustand-demo.pmnd.rs/)                                        | UI state management     |
| [Sonner](https://sonner.emilkowal.ski/)                                         | Toast notifications     |
| [Zod](https://zod.dev/)                                                         | Client-side validation  |
| [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) | Testing                 |

### Shared (`packages/shared`)

|                         |                                              |
| ----------------------- | -------------------------------------------- |
| [Zod](https://zod.dev/) | Schemas and types shared between API and web |

### Tooling

|                                                                                                        |                                   |
| ------------------------------------------------------------------------------------------------------ | --------------------------------- |
| [pnpm workspaces](https://pnpm.io/workspaces)                                                          | Monorepo package manager          |
| [TypeScript 5](https://www.typescriptlang.org/)                                                        | Strict mode throughout            |
| [ESLint 9](https://eslint.org/)                                                                        | Linting (flat config)             |
| [Prettier](https://prettier.io/)                                                                       | Code formatting                   |
| [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) | Pre-commit hooks                  |
| [Commitlint](https://commitlint.js.org/)                                                               | Conventional commit enforcement   |
| [Docker Compose](https://docs.docker.com/compose/)                                                     | Local PostgreSQL                  |
| [GitHub Actions](https://github.com/features/actions)                                                  | CI (lint, typecheck, test, build) |

---

## Project structure

```
apps/
  api/                  Express backend
    src/
      controllers/      Route handlers
      db/               Drizzle client + schema
      middleware/        authenticate, authorize, validate, errorHandler
      migrations/       SQL migrations
      routes/           Route definitions
      services/         Business logic
      types/            TypeScript augmentations
  web/                  React frontend
    src/
      components/ui/    shadcn components
      contexts/         AuthContext
      hooks/            useAuth, useRole
      lib/              apiClient, utils
      pages/            LoginPage, RegisterPage, UnauthorizedPage
packages/
  shared/               Zod schemas + inferred types shared across apps
```

---

## Auth

JWT access tokens (short-lived, in memory) + refresh tokens (httpOnly cookie, 7 days).

**Roles:** `admin` | `user` — assigned on the backend, never trusted from the client.

**Endpoints:**

```
POST /auth/register    Create account
POST /auth/login       Returns access token + sets refresh cookie
POST /auth/refresh     Rotates refresh token, returns new access token
POST /auth/logout      Revokes refresh token + clears cookie
GET  /auth/me          Returns current user (requires Bearer token)
```

**Protecting routes (backend):**

```ts
import { authenticate } from './middleware/authenticate.js'
import { authorize } from './middleware/authorize.js'

router.get('/admin', authenticate, authorize('admin'), handler)
```

**Protecting routes (frontend):**

```tsx
<Route element={<ProtectedRoute roles={['admin']} />}>
  <Route path="/admin" element={<AdminPage />} />
</Route>
```

---

## Getting started

### Prerequisites

- Node.js >= 20
- pnpm >= 10 — `npm install -g pnpm`
- Docker (for the database)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the database

```bash
docker compose up -d
```

Starts PostgreSQL on `localhost:5432` — database `app_db`, user/password `postgres`.

### 3. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
```

Default values work out of the box for local dev. Change `JWT_SECRET` before deploying.

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_DAYS=7
CORS_ORIGIN=http://localhost:5173
```

### 4. Run migrations

```bash
pnpm --filter api db:migrate
```

### 5. Start dev servers

```bash
# In separate terminals:
pnpm --filter api dev    # http://localhost:3000
pnpm --filter web dev    # http://localhost:5173

# Or all at once:
pnpm --parallel -r dev
```

The web dev server proxies `/auth` requests to the API, so no CORS issues in development.

---

## Database

```bash
# Generate a migration after changing schema
pnpm --filter api db:generate

# Apply migrations
pnpm --filter api db:migrate

# Start / stop Postgres
docker compose up -d
docker compose down

# Stop and wipe all data
docker compose down -v
```

---

## Commands

```bash
# Lint
pnpm lint
pnpm lint:fix

# Type-check
pnpm typecheck

# Format
pnpm format
pnpm format:check

# Test
pnpm test
pnpm --filter api test
pnpm --filter web test

# Build
pnpm -r build
pnpm --filter api build
pnpm --filter web build
```

---

## Git workflow

Commits are validated on `git commit` via Husky. Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add password reset flow
fix: handle expired token edge case
chore: update dependencies
```

Staged files are linted and formatted automatically before each commit.
