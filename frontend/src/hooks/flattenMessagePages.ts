import type { Message } from "@/lib/api/types";

/** Merges infinite-query pages into chronological order (oldest → newest). */
export function flattenMessagePages(pages: Message[][]): Message[] {
  return [...pages].reverse().flat();
}
