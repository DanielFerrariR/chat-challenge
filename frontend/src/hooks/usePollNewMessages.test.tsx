import {
  QueryClient,
  QueryClientProvider,
  type InfiniteData,
} from "@tanstack/react-query";
import type { Message } from "@/lib/api/types";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode, RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSeedMessages } from "@/test/msw/fixtures";
import {
  getGetRequests,
  pushIncomingMessage,
  setMessageHandlerState,
} from "@/test/msw/state";

import { messagesQueryKey } from "./queryKeys";
import { usePollNewMessages } from "./usePollNewMessages";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("usePollNewMessages", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("merges into the cache when near the bottom", async () => {
    const seed = createSeedMessages();
    setMessageHandlerState({ initial: seed, older: [], incoming: [] });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(messagesQueryKey, {
      pages: [seed],
      pageParams: [undefined],
    });

    const isNearBottomRef: RefObject<boolean> = { current: true };

    renderHook(
      () => usePollNewMessages({ enabled: true, isNearBottomRef }),
      { wrapper: createWrapper(queryClient) },
    );

    pushIncomingMessage({
      _id: "poll-1",
      message: "From another tab",
      author: "Nina",
      createdAt: "2025-06-01T12:00:00.000Z",
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_000);
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<InfiniteData<Message[]>>(
        messagesQueryKey,
      );
      expect(
        cached?.pages[0]?.some((message) => message._id === "poll-1"),
      ).toBe(true);
    });

    expect(getGetRequests().some((request) => request.after != null)).toBe(true);
  });

  it("merges large batches when near the bottom", async () => {
    const seed = createSeedMessages();
    const bulk = Array.from({ length: 10 }, (_, index) => ({
      _id: `bulk-${String(index)}`,
      message: `Bulk ${String(index)}`,
      author: "Nina",
      createdAt: `2025-06-01T12:00:0${String(index)}.000Z`,
    }));
    setMessageHandlerState({ initial: seed, older: [], incoming: bulk });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(messagesQueryKey, {
      pages: [seed],
      pageParams: [undefined],
    });

    const isNearBottomRef: RefObject<boolean> = { current: true };

    renderHook(
      () => usePollNewMessages({ enabled: true, isNearBottomRef }),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_000);
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<InfiniteData<Message[]>>(
        messagesQueryKey,
      );
      expect(cached?.pages[0]).toHaveLength(seed.length + bulk.length);
    });
  });

  it("buffers without growing the cache when scrolled up", async () => {
    const seed = createSeedMessages();
    setMessageHandlerState({ initial: seed, older: [], incoming: [] });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(messagesQueryKey, {
      pages: [seed],
      pageParams: [undefined],
    });

    const isNearBottomRef: RefObject<boolean> = { current: false };

    const { result } = renderHook(
      () => usePollNewMessages({ enabled: true, isNearBottomRef }),
      { wrapper: createWrapper(queryClient) },
    );

    pushIncomingMessage({
      _id: "poll-1",
      message: "From another tab",
      author: "Nina",
      createdAt: "2025-06-01T12:00:00.000Z",
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_000);
    });

    await waitFor(() => {
      expect(result.current.bufferedCount).toBe(1);
    });

    const cached = queryClient.getQueryData<InfiniteData<Message[]>>(
      messagesQueryKey,
    );
    expect(cached?.pages[0]).toHaveLength(seed.length);

    act(() => {
      result.current.flushBufferedMessages();
    });

    await waitFor(() => {
      const flushed = queryClient.getQueryData<InfiniteData<Message[]>>(
        messagesQueryKey,
      );
      expect(
        flushed?.pages[0]?.some((message) => message._id === "poll-1"),
      ).toBe(true);
      expect(result.current.bufferedCount).toBe(0);
    });
  });
});
