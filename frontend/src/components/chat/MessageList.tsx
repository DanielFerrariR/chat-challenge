import type { ReactNode, Ref } from "react";

type MessageListProps = {
  scrollRef: Ref<HTMLDivElement>;
  children: ReactNode;
};

export function MessageList({ scrollRef, children }: MessageListProps) {
  return (
    <div
      ref={scrollRef}
      data-testid="chat-scroll"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      <ul
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex flex-col gap-4 px-6 py-4"
      >
        {children}
      </ul>
    </div>
  );
}
