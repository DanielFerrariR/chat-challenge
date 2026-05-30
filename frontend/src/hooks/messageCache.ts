import type { InfiniteData } from "@tanstack/react-query";

import type { Message } from "@/lib/api/types";

import { flattenMessagePages } from "./flattenMessagePages";

/** Infinite-query pages[0] holds the newest window; older pages follow. */
export const NEWEST_MESSAGES_PAGE_INDEX = 0;

export function mergeNewMessagesIntoCache(
  current: InfiniteData<Message[]> | undefined,
  incoming: Message[],
): InfiniteData<Message[]> | undefined {
  if (!current?.pages.length || incoming.length === 0) {
    return current;
  }

  const knownIds = new Set(flattenMessagePages(current.pages).map((m) => m._id));
  const toAppend = incoming.filter((m) => !knownIds.has(m._id));
  if (toAppend.length === 0) {
    return current;
  }

  const pages = current.pages.map((page, index) =>
    index === NEWEST_MESSAGES_PAGE_INDEX ? [...page, ...toAppend] : page,
  );

  return { ...current, pages };
}

export function appendToNewestPage(
  current: InfiniteData<Message[]> | undefined,
  message: Message,
): InfiniteData<Message[]> | undefined {
  return mergeNewMessagesIntoCache(current, [message]);
}

export function collectMessageIds(
  current: InfiniteData<Message[]> | undefined,
  buffered: Message[],
): Set<string> {
  const ids = new Set<string>();
  for (const message of [
    ...(current ? flattenMessagePages(current.pages) : []),
    ...buffered,
  ]) {
    ids.add(message._id);
  }
  return ids;
}

export function getNewestCreatedAt(
  current: InfiniteData<Message[]> | undefined,
  buffered: Message[],
): string | undefined {
  const newest = [...(current ? flattenMessagePages(current.pages) : []), ...buffered].at(
    -1,
  );
  return newest?.createdAt;
}

export function filterUnseenMessages(
  incoming: Message[],
  knownIds: Set<string>,
): Message[] {
  return incoming.filter((message) => !knownIds.has(message._id));
}
