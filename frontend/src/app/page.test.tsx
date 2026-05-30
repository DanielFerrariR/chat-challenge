import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import Home from "./page";

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("Home", () => {
  it("renders the chat shell placeholder", () => {
    renderWithProviders(<Home />);

    expect(screen.getByText(/Chat UI coming in Phase 2–4/)).toBeInTheDocument();
  });
});
