import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderChat } from "@/test/renderChat";

describe("Home", () => {
  it("renders messages and compose bar from the API", async () => {
    renderChat();

    await waitFor(() => {
      expect(screen.getByText("Hey team!")).toBeInTheDocument();
    });

    expect(screen.getByText("Hello back")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Message" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument();
  });
});
