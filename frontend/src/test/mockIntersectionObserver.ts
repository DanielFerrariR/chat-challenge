import { vi } from "vitest";

export function mockIntersectionObserver(isIntersecting = true) {
  const observe = vi.fn<(target: Element) => void>();
  const disconnect = vi.fn<() => void>();

  class IntersectionObserverMock implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly scrollMargin = "";
    readonly thresholds: readonly number[] = [];

    constructor(private readonly callback: IntersectionObserverCallback) {}

    observe = observe.mockImplementation((target: Element) => {
      this.callback(
        [
          {
            isIntersecting,
            target,
          } as IntersectionObserverEntry,
        ],
        this,
      );
    });

    disconnect = disconnect;
    unobserve = vi.fn<(target: Element) => void>();
    takeRecords = vi.fn<() => IntersectionObserverEntry[]>();
  }

  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

  return { observe, disconnect };
}
