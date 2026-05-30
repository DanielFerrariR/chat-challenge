"use client";

import { useEffect, useRef } from "react";

type LoadOlderTriggerProps = {
  scrollRoot: HTMLElement | null;
  onVisible: () => void;
  hasMore: boolean;
  isLoading: boolean;
};

export function LoadOlderTrigger({
  scrollRoot,
  onVisible,
  hasMore,
  isLoading,
}: LoadOlderTriggerProps) {
  const sentinelRef = useRef<HTMLLIElement>(null);

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
      { root: scrollRoot, rootMargin: "80px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollRoot, hasMore, isLoading, onVisible]);

  if (!hasMore) {
    return null;
  }

  return (
    <li
      ref={sentinelRef}
      className="list-none py-2 text-center text-sm text-chat-meta"
      aria-busy={isLoading}
    >
      {isLoading ? "Loading older messages…" : "\u00a0"}
    </li>
  );
}
