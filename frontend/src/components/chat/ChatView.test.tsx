import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_AUTHOR } from "@/lib/api/messages";
import { MESSAGES_PAGE_SIZE } from "@/hooks/queryKeys";
import { mockIntersectionObserver } from "@/test/mockIntersectionObserver";
import {
  getGetRequests,
  getLastPostBody,
  pushIncomingMessage,
  resetMessageHandlerState,
  setFullPageWithOlderHistory,
} from "@/test/msw/state";

import { ChatView } from "./ChatView";

function renderChatView(enableMessagePolling = false) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ChatView enableMessagePolling={enableMessagePolling} />
    </QueryClientProvider>,
  );
}

describe("ChatView", () => {
  afterEach(() => {
    cleanup();
  });

  it("sends a message as John Doe and clears the input", async () => {
    const user = userEvent.setup();
    resetMessageHandlerState();
    renderChatView();

    await waitFor(() => {
      expect(screen.getByText("Hey team!")).toBeInTheDocument();
    });

    const input = screen.getByRole("textbox", { name: "Message" });
    await user.type(input, "New update");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(screen.getByText("New update")).toBeInTheDocument();
    });

    expect(input).toHaveValue("");
    expect(getLastPostBody()).toEqual({
      message: "New update",
      author: DEFAULT_AUTHOR,
    });
  });

  it("loads older messages when the top sentinel is visible", async () => {
    mockIntersectionObserver(true);
    setFullPageWithOlderHistory();

    renderChatView();

    await waitFor(() => {
      expect(screen.getByText("Message 0")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Older message")).toBeInTheDocument();
    });

    const getRequests = getGetRequests();
    expect(getRequests).toHaveLength(2);
    expect(getRequests[0]?.limit).toBe(String(MESSAGES_PAGE_SIZE));
    expect(getRequests[1]?.before).toBe("2024-01-01T12:00:00.000Z");
    expect(getRequests[1]?.limit).toBe(String(MESSAGES_PAGE_SIZE));
  });

  it("shows a new messages button without growing the list while scrolled up", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    resetMessageHandlerState();

    try {
      renderChatView(true);

      await waitFor(() => {
        expect(screen.getByText("Hey team!")).toBeInTheDocument();
      });

      const scroll = screen.getByTestId("chat-scroll");
      Object.defineProperty(scroll, "scrollHeight", {
        configurable: true,
        value: 1_000,
      });
      Object.defineProperty(scroll, "clientHeight", {
        configurable: true,
        value: 400,
      });
      scroll.scrollTop = 0;
      fireEvent.scroll(scroll);

      const listItemsBefore = screen.getAllByRole("listitem").length;

      pushIncomingMessage({
        _id: "incoming-1",
        message: "Buffered while reading history",
        author: "Nina",
        createdAt: "2025-06-01T12:00:00.000Z",
      });

      await vi.advanceTimersByTimeAsync(4_000);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Jump to 1 new message" }),
        ).toBeInTheDocument();
      });

      expect(screen.getAllByRole("listitem").length).toBe(listItemsBefore);
      expect(
        screen.queryByText("Buffered while reading history"),
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows an empty state when there are no messages", async () => {
    resetMessageHandlerState({ initial: [], older: [], incoming: [] });

    renderChatView();

    await waitFor(() => {
      expect(
        screen.getByText(/No messages yet. Send the first one below./),
      ).toBeInTheDocument();
    });
  });
});
