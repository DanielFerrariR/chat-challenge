import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  createFullPageMessages,
  olderMessages,
} from "@/test/msw/fixtures";
import { getGetRequests, setMessageHandlerState } from "@/test/msw/state";

import { MESSAGES_PAGE_SIZE } from "./queryKeys";
import { useInfiniteMessages } from "./useMessages";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useInfiniteMessages", () => {
  it("loads the initial page without a cursor", async () => {
    const pageOne = createFullPageMessages();
    setMessageHandlerState({ initial: pageOne, older: olderMessages });

    const { result } = renderHook(() => useInfiniteMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getGetRequests()[0]?.limit).toBe(String(MESSAGES_PAGE_SIZE));
    expect(getGetRequests()[0]?.before).not.toBeNull();
    expect(result.current.messages).toHaveLength(MESSAGES_PAGE_SIZE);
    expect(result.current.hasNextPage).toBe(true);
  });

  it("fetches older messages with before cursor", async () => {
    const pageOne = createFullPageMessages();
    setMessageHandlerState({ initial: pageOne, older: olderMessages });

    const { result } = renderHook(() => useInfiniteMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    const getRequests = getGetRequests();
    expect(getRequests[1]?.before).toBe(pageOne[0]?.createdAt);
    expect(getRequests[1]?.limit).toBe(String(MESSAGES_PAGE_SIZE));
    expect(result.current.messages.map((message) => message._id)).toEqual([
      "older-1",
      ...pageOne.map((message) => message._id),
    ]);
  });

  it("stops when a page is shorter than the limit", async () => {
    setMessageHandlerState({ initial: olderMessages, older: [] });

    const { result } = renderHook(() => useInfiniteMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(false);
  });
});
