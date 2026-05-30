import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as messagesApi from "@/lib/api/messages";
import type { Message } from "@/lib/api/types";

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

const pageOne: Message[] = Array.from({ length: MESSAGES_PAGE_SIZE }, (_, i) => ({
  _id: `page1-${String(i)}`,
  message: `msg-${String(i)}`,
  author: "Luka",
  createdAt: `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`,
}));

const pageTwo: Message[] = [
  {
    _id: "older-1",
    message: "older",
    author: "John",
    createdAt: "2023-12-01T00:00:00.000Z",
  },
];

describe("useInfiniteMessages", () => {
  beforeEach(() => {
    vi.spyOn(messagesApi, "getMessages");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the initial page without a cursor", async () => {
    vi.mocked(messagesApi.getMessages).mockResolvedValueOnce(pageOne);

    const { result } = renderHook(() => useInfiniteMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(messagesApi.getMessages).toHaveBeenCalledWith({
      limit: MESSAGES_PAGE_SIZE,
    });
    expect(result.current.messages).toHaveLength(MESSAGES_PAGE_SIZE);
    expect(result.current.hasNextPage).toBe(true);
  });

  it("fetches older messages with before cursor", async () => {
    vi.mocked(messagesApi.getMessages).mockImplementation(async (params) => {
      if (params?.before) {
        return pageTwo;
      }
      return pageOne;
    });

    const { result } = renderHook(() => useInfiniteMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(messagesApi.getMessages).toHaveBeenLastCalledWith({
      before: pageOne[0]?.createdAt,
      limit: MESSAGES_PAGE_SIZE,
    });
    expect(result.current.messages.map((m) => m._id)).toEqual([
      "older-1",
      ...pageOne.map((m) => m._id),
    ]);
  });

  it("stops when a page is shorter than the limit", async () => {
    vi.mocked(messagesApi.getMessages).mockResolvedValueOnce(pageTwo);

    const { result } = renderHook(() => useInfiniteMessages(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(false);
  });
});
