"use client";

import {
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { getMessages } from "@/lib/api/messages";
import type { Message } from "@/lib/api/types";

import {
  collectMessageIds,
  filterUnseenMessages,
  getNewestCreatedAt,
  mergeNewMessagesIntoCache,
} from "./messageCache";
import {
  MESSAGES_POLL_LIMIT,
  messagesPollQueryKey,
  messagesQueryKey,
} from "./queryKeys";

const MESSAGES_POLL_INTERVAL_MS = 4_000;

type UsePollNewMessagesOptions = {
  enabled: boolean;
  isNearBottomRef: RefObject<boolean>;
};

export function usePollNewMessages({
  enabled,
  isNearBottomRef,
}: UsePollNewMessagesOptions) {
  const queryClient = useQueryClient();
  const bufferRef = useRef<Message[]>([]);
  const [bufferedCount, setBufferedCount] = useState(0);

  const flushBufferedMessages = useCallback(() => {
    const buffered = bufferRef.current;
    if (buffered.length === 0) {
      return;
    }

    queryClient.setQueryData<InfiniteData<Message[]>>(
      messagesQueryKey,
      (current) => mergeNewMessagesIntoCache(current, buffered),
    );
    bufferRef.current = [];
    setBufferedCount(0);
  }, [queryClient]);

  const pollQuery = useQuery({
    queryKey: messagesPollQueryKey,
    enabled,
    refetchInterval: MESSAGES_POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      const current = queryClient.getQueryData<InfiniteData<Message[]>>(
        messagesQueryKey,
      );
      const after = getNewestCreatedAt(current, bufferRef.current);
      if (!after) {
        return [];
      }

      return getMessages({ after, limit: MESSAGES_POLL_LIMIT });
    },
  });

  useEffect(() => {
    const incoming = pollQuery.data;
    if (!incoming?.length) {
      return;
    }

    const current = queryClient.getQueryData<InfiniteData<Message[]>>(
      messagesQueryKey,
    );
    const knownIds = collectMessageIds(current, bufferRef.current);
    const unseen = filterUnseenMessages(incoming, knownIds);
    if (unseen.length === 0) {
      return;
    }

    if (isNearBottomRef.current) {
      const toMerge = [...bufferRef.current, ...unseen];
      bufferRef.current = [];
      setBufferedCount(0);
      queryClient.setQueryData<InfiniteData<Message[]>>(
        messagesQueryKey,
        (cached) => mergeNewMessagesIntoCache(cached, toMerge),
      );
      return;
    }

    bufferRef.current.push(...unseen);
    setBufferedCount(bufferRef.current.length);
  }, [pollQuery.data, queryClient, isNearBottomRef]);

  return {
    bufferedCount,
    flushBufferedMessages,
    isPolling: pollQuery.isFetching,
  };
}
