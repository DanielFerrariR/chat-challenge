# The Challenge (Frontend Engineer)

We would like you to build a simple chat interface in TypeScript that sends and displays messages from all senders. The design should resemble the example below:

<img src="chat.png" width="400" alt="chat" />

The assets and additional documentation are available in the **assets** folder.

## Overview

Your task is to implement the frontend for a chat application. The backend API, which handles message storage and retrieval, has been shared as another repository.

**For the backend implementation details and setup instructions, please refer to the [Frontend Challenge Chat API repository](https://github.com/DoodleScheduling/frontend-challenge-chat-api)**.

## Project Setup

This repository ships with a [Next.js](https://nextjs.org/) (App Router) starter using React, TypeScript, Vitest, and oxlint/oxfmt.

### Prerequisites

- [Node.js](https://nodejs.org/) `22.20.0` (see `.nvmrc` if you use nvm)
- [pnpm](https://pnpm.io/) `>=10`

### Install and run

```shell
pnpm install
pnpm dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

> **Note:** The backend API runs on port `3000` by default, so the frontend dev server uses port `3001` to avoid a conflict.

Start with `src/app/page.tsx` and add components under `src/` as needed.

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

### Frontend challenge Chat API Details

- **Authentication:** All message related endpoints require a Bearer token.
- **Endpoints:**
  - **GET /api/v1/messages:** Retrieves messages in reverse chronological order with optional pagination.
  - **POST /api/v1/messages:** Creates a new chat message.
- **Example cURL Commands after you run it locally:**

  **List all messages:**

  ```shell script
  curl http://localhost:3000/api/v1/messages \
    -H "Authorization: Bearer super-secret-doodle-token"
  ```

  **List 10 messages after a specific timestamp:**

  ```shell script
  curl "http://localhost:3000/api/v1/messages?after=2023-01-01T00:00:00.000Z&limit=10" \
    -H "Authorization: Bearer super-secret-doodle-token"
  ```

  **Send a message:**

  ```shell script
  curl -X POST http://localhost:3000/api/v1/messages \
    -H "Authorization: Bearer super-secret-doodle-token" \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello world", "author": "John Doe"}'
  ```

## Challenge Requirements

- **Time Commitment:** Spend 4 to 6 hours on the challenge over the course of one week.
- **Technology:** Build the interface using React and TypeScript. This repo is pre-configured with Next.js (App Router).
- **Responsiveness:** The interface must be responsive and work smoothly on commonly used browsers and mobile devices.
- **Code Quality:** Maintain clear code readability, commit often with useful messages, and prioritize performance and accessibility.

## What We’re Looking For

- **Code Readability and Clean Architecture**
- **Commit Quality:** Frequent, descriptive commits.
- **Performance:** Fast load times and efficient rendering for mobile devices.
- **Accessibility:** User friendly design that is accessible to everyone.
- **Design Attention:** We are not looking for pixel perfect results, but we love attention to detail.

## Submission

Once completed, send an email with a link to your repository to `code-challenge@doodle.com` with the subject `FE-<yourname>`. For example, if your name is "Paul Smith", the subject should be `FE-Paul Smith`.

We will review your submission within one week although sometimes it might take a bit longer.

Good luck and happy coding!
