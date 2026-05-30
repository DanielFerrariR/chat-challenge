"use client";

import { useEffect, useRef } from "react";

type LoadOlderTriggerProps = {
  onVisible: () => void;
  hasMore: boolean;
  isLoading: boolean;
};

export function LoadOlderTrigger({
  onVisible,
  hasMore,
  isLoading,
}: LoadOlderTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onVisible();
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onVisible]);

  if (!hasMore) {
    return null;
  }

  return (
    <div ref={sentinelRef} className="py-2 text-center text-sm text-chat-meta">
      {isLoading ? "Loading older messages…" : null}
    </div>
  );
}
