# Chat Challenge

Doodle frontend engineer challenge — monorepo with the chat API (`backend/`) and Next.js app (`frontend/`).

## Prerequisites

- [Node.js](https://nodejs.org/) `22.20.0` (see `frontend/.nvmrc` if you use nvm)
- [pnpm](https://pnpm.io/) `>=10`
- [Docker](https://www.docker.com/) (for the backend)

## Backend

From `backend/`:

```shell
docker compose up
```

The API runs at [http://localhost:3000](http://localhost:3000). See [backend/README.md](./backend/README.md) for details.

## Frontend

From `frontend/`:

```shell
pnpm install
cp .env.local.example .env.local
pnpm dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

> **Note:** The backend API runs on port `3000` by default, so the frontend dev server uses port `3001` to avoid a conflict.

### Environment variables

The frontend reads API settings from `.env.local` (gitignored). Copy the example file before starting the dev server:

```shell
cp .env.local.example .env.local
```

| Variable | Description | Default (example file) |
| -------- | ----------- | ---------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the chat API (no trailing slash) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_TOKEN` | Bearer token for `Authorization` on message endpoints | `super-secret-doodle-token` |

These values match the Docker backend in `backend/` (see [backend/README.md](./backend/README.md)). If `.env.local` is missing, the app falls back to the same defaults in code.

Do not commit `.env.local`; only [frontend/.env.local.example](./frontend/.env.local.example) is tracked.

### Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the development server (Turbopack) |
| `pnpm build`     | Create a production build                |
| `pnpm start`     | Serve the production build               |
| `pnpm test`          | Run tests                                |
| `pnpm seed:messages` | POST 100 test messages to the API (API must be up) |
| `pnpm lint`          | Lint with oxlint                         |
| `pnpm typecheck`     | Run TypeScript type checking             |

Git hooks (format, lint, typecheck) are installed automatically via [lefthook](https://github.com/evilmartians/lefthook) when you run `pnpm install`.

### Commit conventions

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) with a `frontend` scope for app work:

```
<type>(frontend): <imperative summary>
```

| Type | Use for |
| ---- | ------- |
| `chore` | Dependencies, tooling, scaffold without user-facing behavior |
| `docs` | README or setup instructions only |
| `feat` | New user-visible behavior (API client, hooks, UI wiring) |
| `test` | Tests only |
| `fix` | Bug fixes |

Keep one logical change per commit (setup → API → hooks → UI). Optional body line explains **why**, not a file list.

## Challenge brief

See [frontend/README.md](./frontend/README.md) for the full challenge requirements and design assets.
