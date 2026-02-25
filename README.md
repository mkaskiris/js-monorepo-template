# JS MonoRepo Template

A full-stack e-learning platform built as a pnpm monorepo.

## Structure

```
apps/
  web/   – React + Vite frontend
  api/   – Express 5 + TypeScript backend
packages/  – shared packages (future)
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 10 (`npm install -g pnpm`)
- [Docker](https://www.docker.com/) (for the database)

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the database

```bash
docker compose up -d
```

This starts a Postgres 18 container on port `5432` with:

- **Host:** `localhost:5432`
- **Database:** `adult_learning`
- **User:** `postgres`
- **Password:** `postgres`

### 3. Environment variables

Copy the example env file for the API and fill in the values:

```bash
cp apps/api/.env.example apps/api/.env
```

### 4. Run in development

Start both apps in separate terminals:

```bash
# Terminal 1 — API (http://localhost:3000)
pnpm --filter api dev

# Terminal 2 — Web (http://localhost:5173)
pnpm --filter web dev
```

Or run everything at once:

```bash
pnpm --parallel -r dev
```

## Other commands

```bash
# Lint all packages
pnpm lint

# Fix lint errors
pnpm lint:fix

# Type-check all packages
pnpm typecheck

# Run all tests (once)
pnpm test

# Run tests in watch mode
pnpm --filter web test
pnpm --filter api test

# Check formatting
pnpm format:check

# Apply formatting
pnpm format

# Build all packages
pnpm -r build

# Build a single package
pnpm --filter api build
pnpm --filter web build
```

## Git workflow

Commits are linted automatically on `git commit` via Husky. Messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve token expiry bug
chore: update dependencies
docs: add API reference
```

Staged files are also linted and formatted automatically before each commit.

## Database

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Stop and delete all data
docker compose down -v
```
