type SkeletonBarProps = {
  className?: string;
};

function SkeletonBar({ className = "" }: SkeletonBarProps) {
  return (
    <div
      className={`rounded bg-chat-meta/25 animate-pulse ${className}`.trim()}
      aria-hidden
    />
  );
}

type MessageSkeletonProps = {
  align: "start" | "end";
};

export function MessageSkeleton({ align }: MessageSkeletonProps) {
  const isSent = align === "end";

  return (
    <li
      className={`flex ${isSent ? "justify-end" : "justify-start"}`}
      aria-hidden
    >
      <div
        className={`max-w-chat-bubble w-[80%] rounded px-4 py-4 shadow-sm sm:w-72 ${
          isSent ? "bg-chat-sent/70" : "bg-white/90"
        }`}
      >
        {!isSent ? <SkeletonBar className="mb-2 h-3 w-20" /> : null}
        <SkeletonBar className="h-4 w-full max-w-xs" />
        <SkeletonBar className="mt-3 h-3 w-28" />
      </div>
    </li>
  );
}

type MessageListSkeletonProps = {
  count?: number;
};

export function MessageListSkeleton({ count = 5 }: MessageListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <MessageSkeleton
          key={index}
          align={index % 2 === 0 ? "start" : "end"}
        />
      ))}
      <li className="sr-only" role="status">
        Loading messages
      </li>
    </>
  );
}

export function LoadOlderSkeleton() {
  return (
    <li className="list-none py-2" role="status" aria-label="Loading older messages">
      <div className="mx-auto h-4 w-36 animate-pulse rounded bg-white/80" />
    </li>
  );
}
