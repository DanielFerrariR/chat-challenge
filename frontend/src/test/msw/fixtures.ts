import { DEFAULT_AUTHOR } from "@/lib/api/messages";
import type { Message } from "@/lib/api/types";

import { MESSAGES_PAGE_SIZE } from "@/hooks/queryKeys";

export function createSeedMessages(): Message[] {
  return [
    {
      _id: "seed-1",
      message: "Hey team!",
      author: "Luka",
      createdAt: "2024-01-01T10:00:00.000Z",
    },
    {
      _id: "seed-2",
      message: "Hello back",
      author: DEFAULT_AUTHOR,
      createdAt: "2024-01-01T11:00:00.000Z",
    },
  ];
}

export function createFullPageMessages(): Message[] {
  return Array.from({ length: MESSAGES_PAGE_SIZE }, (_, index) => ({
    _id: `page-${String(index)}`,
    message: `Message ${String(index)}`,
    author: "Luka",
    createdAt: `2024-01-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
  }));
}

export const olderMessages: Message[] = [
  {
    _id: "older-1",
    message: "Older message",
    author: "Nina",
    createdAt: "2023-12-01T00:00:00.000Z",
  },
];
