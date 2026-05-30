import { describe, expect, it } from "vitest";

import { flattenMessagePages } from "./flattenMessagePages";

describe("flattenMessagePages", () => {
  it("orders pages oldest to newest", () => {
    const pages = [
      [
        { _id: "2", message: "b", author: "A", createdAt: "2024-01-02T00:00:00.000Z" },
        { _id: "3", message: "c", author: "A", createdAt: "2024-01-03T00:00:00.000Z" },
      ],
      [
        { _id: "1", message: "a", author: "A", createdAt: "2024-01-01T00:00:00.000Z" },
      ],
    ];

    expect(flattenMessagePages(pages).map((m) => m._id)).toEqual(["1", "2", "3"]);
  });
});
