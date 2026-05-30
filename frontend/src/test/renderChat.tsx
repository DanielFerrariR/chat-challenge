import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

import { ChatView } from "@/components/chat/ChatView";
import Home from "@/app/page";

import { resetMessageHandlerState } from "./msw/state";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

type RenderChatOptions = {
  route?: "home" | "chat";
  resetHandlers?: boolean;
} & Omit<RenderOptions, "wrapper">;

export function renderChat(options: RenderChatOptions = {}) {
  const { route = "home", resetHandlers = true, ...renderOptions } = options;

  if (resetHandlers) {
    resetMessageHandlerState();
  }
  const queryClient = createTestQueryClient();
  const ui: ReactElement = route === "home" ? <Home /> : <ChatView />;

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
