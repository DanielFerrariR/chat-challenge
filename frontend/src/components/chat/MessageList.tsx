import type { ReactNode } from "react";

type MessageListProps = {
  children: ReactNode;
};

export function MessageList({ children }: MessageListProps) {
  return (
    <ul
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4"
    >
      {children}
    </ul>
  );
}
