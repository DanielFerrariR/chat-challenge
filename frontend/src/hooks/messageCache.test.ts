import type { InfiniteData } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import type { Message } from "@/lib/api/types";

import { mergeNewMessagesIntoCache } from "./messageCache";

const base: InfiniteData<Message[]> = {
  pages: [
    [
      {
        _id: "a",
        message: "First",
        author: "Luka",
        createdAt: "2024-01-01T10:00:00.000Z",
      },
    ],
  ],
  pageParams: [undefined],
};

describe("mergeNewMessagesIntoCache", () => {
  it("appends unseen messages to the newest page", () => {
    const incoming: Message[] = [
      {
        _id: "b",
        message: "Second",
        author: "Nina",
        createdAt: "2024-01-01T11:00:00.000Z",
      },
    ];

    const merged = mergeNewMessagesIntoCache(base, incoming);

    expect(merged?.pages[0]).toHaveLength(2);
    expect(merged?.pages[0]?.[1]?._id).toBe("b");
  });

  it("dedupes by message id", () => {
    const merged = mergeNewMessagesIntoCache(base, [base.pages[0]![0]!]);

    expect(merged).toBe(base);
  });
});
