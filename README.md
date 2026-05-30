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
pnpm dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

> **Note:** The backend API runs on port `3000` by default, so the frontend dev server uses port `3001` to avoid a conflict.

### Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the development server (Turbopack) |
| `pnpm build`     | Create a production build                |
| `pnpm start`     | Serve the production build               |
| `pnpm test`      | Run tests                                |
| `pnpm lint`      | Lint with oxlint                         |
| `pnpm typecheck` | Run TypeScript type checking             |

Git hooks (format, lint, typecheck) are installed automatically via [lefthook](https://github.com/evilmartians/lefthook) when you run `pnpm install`.

## Challenge brief

See [frontend/README.md](./frontend/README.md) for the full challenge requirements and design assets.
