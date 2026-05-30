import type { ReactNode } from "react";

type ChatShellProps = {
  children: ReactNode;
};

export function ChatShell({ children }: ChatShellProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-chat-bg bg-cover bg-center bg-no-repeat">
      {children}
    </main>
  );
}
