import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DEFAULT_AUTHOR } from "@/lib/api/messages";
import type { Message } from "@/lib/api/types";

import { MessageBubble } from "./MessageBubble";

function renderBubble(message: Message) {
  const view = render(
    <ul>
      <MessageBubble message={message} />
    </ul>,
  );
  const listItem = screen.getByText(message.message, { exact: false }).closest("li");
  return { ...view, listItem };
}

describe("MessageBubble", () => {
  it("aligns received messages to the left with author", () => {
    const message: Message = {
      _id: "1",
      message: "Hey team!",
      author: "Luka",
      createdAt: "2024-01-01T10:00:00.000Z",
    };

    const { listItem } = renderBubble(message);

    expect(listItem).toHaveClass("justify-start");
    expect(screen.getByText("Luka")).toBeInTheDocument();
  });

  it("aligns John Doe messages to the right without author label", () => {
    const message: Message = {
      _id: "2",
      message: "Hello back",
      author: DEFAULT_AUTHOR,
      createdAt: "2024-01-01T11:00:00.000Z",
    };

    const { listItem } = renderBubble(message);

    expect(listItem).toHaveClass("justify-end");
    expect(screen.queryByText(DEFAULT_AUTHOR)).not.toBeInTheDocument();
  });
});
