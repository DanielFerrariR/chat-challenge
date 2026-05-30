import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as messagesApi from "@/lib/api/messages";
import { DEFAULT_AUTHOR } from "@/lib/api/messages";

import Home from "./page";

const seedMessages = [
  {
    _id: "1",
    message: "Hey team!",
    author: "Luka",
    createdAt: "2024-01-01T10:00:00.000Z",
  },
  {
    _id: "2",
    message: "Hello back",
    author: DEFAULT_AUTHOR,
    createdAt: "2024-01-01T11:00:00.000Z",
  },
];

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("Home", () => {
  beforeEach(() => {
    vi.spyOn(messagesApi, "getMessages").mockResolvedValue(seedMessages);
    vi.spyOn(messagesApi, "createMessage");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders messages and compose bar", async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Hey team!")).toBeInTheDocument();
    });

    expect(screen.getByText("Hello back")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Message" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });
});
