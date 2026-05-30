"use client";

import { useEffect, useRef } from "react";

import { LoadOlderSkeleton } from "./MessageSkeleton";

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
  const onVisibleRef = useRef(onVisible);

  onVisibleRef.current = onVisible;

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading) {
          onVisibleRef.current();
        }
      },
      { root: scrollRoot, rootMargin: "120px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollRoot, hasMore, isLoading]);

  if (!hasMore) {
    return null;
  }

  return (
    <>
      {isLoading ? <LoadOlderSkeleton /> : null}
      <li ref={sentinelRef} className="list-none h-px shrink-0" aria-hidden />
    </>
  );
}
