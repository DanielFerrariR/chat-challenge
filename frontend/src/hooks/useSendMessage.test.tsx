import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_AUTHOR } from "@/lib/api/messages";
import * as messagesApi from "@/lib/api/messages";
import type { Message } from "@/lib/api/types";

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

const created: Message = {
  _id: "new-1",
  message: "Hello team",
  author: DEFAULT_AUTHOR,
  createdAt: "2024-01-02T00:00:00.000Z",
};

describe("useSendMessage", () => {
  beforeEach(() => {
    vi.spyOn(messagesApi, "createMessage");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts as John Doe and appends to the latest page", async () => {
    vi.mocked(messagesApi.createMessage).mockResolvedValueOnce(created);

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

    expect(messagesApi.createMessage).toHaveBeenCalledWith({
      message: "Hello team",
      author: DEFAULT_AUTHOR,
    });

    const cached = queryClient.getQueryData<{ pages: Message[][] }>(
      messagesQueryKey,
    );
    expect(cached?.pages[0]).toEqual([...existing, created]);
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

    expect(messagesApi.createMessage).not.toHaveBeenCalled();
  });
});
