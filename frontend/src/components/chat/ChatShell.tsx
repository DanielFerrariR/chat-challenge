import type { ReactNode } from "react";

type ChatShellProps = {
  children: ReactNode;
};

export function ChatShell({ children }: ChatShellProps) {
  return (
    <main className="flex h-dvh flex-col bg-chat-doodle bg-cover bg-center bg-no-repeat">
      {children}
    </main>
  );
}
