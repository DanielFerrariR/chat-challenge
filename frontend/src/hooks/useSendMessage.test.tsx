import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { DEFAULT_AUTHOR } from "@/lib/api/messages";
import type { Message } from "@/lib/api/types";
import { getLastPostBody } from "@/test/msw/state";

import { messagesQueryKey } from "./queryKeys";
import { useSendMessage } from "./useSendMessage";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const existing: Message[] = [
  {
    _id: "existing-1",
    message: "Hi",
    author: "Luka",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("useSendMessage", () => {
  it("posts as John Doe and appends to the latest page", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(messagesQueryKey, {
      pages: [existing],
      pageParams: [undefined],
    });

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate("Hello team");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getLastPostBody()).toEqual({
      message: "Hello team",
      author: DEFAULT_AUTHOR,
    });

    const cached = queryClient.getQueryData<{ pages: Message[][] }>(
      messagesQueryKey,
    );
    expect(cached?.pages[0]).toHaveLength(2);
    expect(cached?.pages[0]?.[1]?.message).toBe("Hello team");
    expect(cached?.pages[0]?.[1]?.author).toBe(DEFAULT_AUTHOR);
  });

  it("rejects empty messages before calling the API", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });

    const { result } = renderHook(() => useSendMessage(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate("   ");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getLastPostBody()).toBeNull();
  });
});
