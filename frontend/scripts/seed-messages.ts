/**
 * Seeds the chat API via POST /api/v1/messages (default: 100 messages).
 * Requires the API to be running and .env.local (or defaults from .env.local.example).
 *
 * Usage: pnpm seed:messages
 */

import { createMessage, DEFAULT_AUTHOR } from "../src/lib/api/messages.js";
import { env } from "../src/lib/env.js";

const MESSAGE_COUNT = Number(process.env.MESSAGE_COUNT ?? "100");

const OTHER_AUTHORS = [
  "Luka",
  "Nina",
  "martin57",
  "NINJA",
  "Patricia",
  "Maddie",
  "John",
] as const;

function pickAuthor(index: number): string {
  if (index % 10 < 3) {
    return DEFAULT_AUTHOR;
  }
  return OTHER_AUTHORS[index % OTHER_AUTHORS.length] ?? "Luka";
}

function buildMessage(index: number, author: string): string {
  if (author === DEFAULT_AUTHOR) {
    return `Update ${index}: I can help with the frontend — let me know if this works for you.`;
  }

  const templates = [
    `Message ${index}: Sounds good to me.`,
    `Message ${index}: I will review this afternoon.`,
    `Message ${index}: Can we sync on the timeline?`,
    `Message ${index}: Staging looks healthy from my side.`,
  ];

  return templates[index % templates.length] ?? `Message ${index}.`;
}

async function main(): Promise<void> {
  console.log(
    `Creating ${String(MESSAGE_COUNT)} messages at ${env.apiBaseUrl}/api/v1/messages …`,
  );

  for (let index = 1; index <= MESSAGE_COUNT; index++) {
    const author = pickAuthor(index);
    const message = buildMessage(index, author);
    await createMessage({ message, author });

    if (index % 10 === 0 || index === MESSAGE_COUNT) {
      console.log(`  ${String(index)}/${String(MESSAGE_COUNT)} created`);
    }
  }

  const johnDoeCount = Array.from({ length: MESSAGE_COUNT }, (_, i) =>
    pickAuthor(i + 1) === DEFAULT_AUTHOR ? 1 : 0,
  ).reduce<number>((sum, value) => sum + value, 0);

  console.log(
    `Done. ${String(MESSAGE_COUNT)} messages created (~${String(johnDoeCount)} from ${DEFAULT_AUTHOR}).`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
