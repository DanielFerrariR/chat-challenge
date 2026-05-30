"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getMessages } from "@/lib/api/messages";

import { flattenMessagePages } from "./flattenMessagePages";
import { MESSAGES_PAGE_SIZE, messagesQueryKey } from "./queryKeys";

export function useInfiniteMessages() {
  const query = useInfiniteQuery({
    queryKey: messagesQueryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      pageParam === undefined
        ? getMessages({ limit: MESSAGES_PAGE_SIZE })
        : getMessages({ before: pageParam, limit: MESSAGES_PAGE_SIZE }),
    getNextPageParam: (lastPage) => {
      if (lastPage.length < MESSAGES_PAGE_SIZE) {
        return undefined;
      }

      return lastPage[0]?.createdAt;
    },
  });

  return {
    ...query,
    messages: query.data ? flattenMessagePages(query.data.pages) : [],
  };
}
