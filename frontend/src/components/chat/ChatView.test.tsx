import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_AUTHOR } from "@/lib/api/messages";
import { MESSAGES_PAGE_SIZE } from "@/hooks/queryKeys";
import { mockIntersectionObserver } from "@/test/mockIntersectionObserver";
import {
  getGetRequests,
  getLastPostBody,
  resetMessageHandlerState,
  setFullPageWithOlderHistory,
} from "@/test/msw/state";
import { renderChat } from "@/test/renderChat";

describe("ChatView", () => {
  afterEach(() => {
    cleanup();
  });

  it("sends a message as John Doe and clears the input", async () => {
    const user = userEvent.setup();
    renderChat({ route: "chat" });

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

    renderChat({ route: "chat", resetHandlers: false });

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

  it("shows an empty state when there are no messages", async () => {
    resetMessageHandlerState({ initial: [], older: [] });

    renderChat({ route: "chat", resetHandlers: false });

    await waitFor(() => {
      expect(
        screen.getByText(/No messages yet. Send the first one below./),
      ).toBeInTheDocument();
    });
  });
});
