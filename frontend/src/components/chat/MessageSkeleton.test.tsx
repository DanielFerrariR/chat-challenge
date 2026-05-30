import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MessageListSkeleton } from "./MessageSkeleton";

describe("MessageListSkeleton", () => {
  it("exposes a loading status for screen readers", () => {
    render(
      <ul>
        <MessageListSkeleton count={2} />
      </ul>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Loading messages");
  });
});
