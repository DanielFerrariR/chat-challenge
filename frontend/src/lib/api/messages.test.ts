import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, UnauthorizedError } from "./errors";
import {
  createMessage,
  DEFAULT_AUTHOR,
  getMessages,
  MESSAGES_PATH,
} from "./messages";

const API_BASE = "http://localhost:3000";
const TOKEN = "super-secret-doodle-token";

const sampleMessage = {
  _id: "msg-1",
  message: "Hello",
  author: "Luka",
  createdAt: "2024-01-01T12:00:00.000Z",
};

function mockFetch(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Response | Promise<Response>,
) {
  vi.stubGlobal("fetch", vi.fn(handler));
}

describe("getMessages", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", API_BASE);
    vi.stubEnv("NEXT_PUBLIC_API_TOKEN", TOKEN);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("fetches messages with auth header", async () => {
    mockFetch((input, init) => {
      expect(String(input)).toBe(`${API_BASE}${MESSAGES_PATH}`);
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe(`Bearer ${TOKEN}`);

      return new Response(JSON.stringify([sampleMessage]), { status: 200 });
    });

    const messages = await getMessages();

    expect(messages).toEqual([sampleMessage]);
  });

  it("passes pagination query params", async () => {
    mockFetch((input) => {
      const url = new URL(String(input));
      expect(url.searchParams.get("before")).toBe("2024-01-01T00:00:00.000Z");
      expect(url.searchParams.get("limit")).toBe("20");

      return new Response(JSON.stringify([]), { status: 200 });
    });

    await getMessages({
      before: "2024-01-01T00:00:00.000Z",
      limit: 20,
    });
  });

  it("throws UnauthorizedError on 401", async () => {
    mockFetch(() => {
      return new Response(
        JSON.stringify({
          message: "Invalid token",
          statusCode: 401,
          error: "Unauthorized",
        }),
        { status: 401 },
      );
    });

    await expect(getMessages()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws ValidationError on 400", async () => {
    mockFetch(() => {
      return new Response(
        JSON.stringify({
          error: {
            message: [{ field: "before", message: "Invalid timestamp format" }],
            timestamp: "2024-01-01T00:00:00.000Z",
          },
        }),
        { status: 400 },
      );
    });

    await expect(
      getMessages({ before: "not-a-date" }),
    ).rejects.toMatchObject({
      name: "ValidationError",
      fields: [{ field: "before", message: "Invalid timestamp format" }],
    });
  });
});

describe("createMessage", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", API_BASE);
    vi.stubEnv("NEXT_PUBLIC_API_TOKEN", TOKEN);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("posts message body as JSON", async () => {
    mockFetch((input, init) => {
      expect(String(input)).toBe(`${API_BASE}${MESSAGES_PATH}`);
      expect(init?.method).toBe("POST");
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe(`Bearer ${TOKEN}`);
      expect(headers.get("Content-Type")).toBe("application/json");
      expect(init?.body).toBe(
        JSON.stringify({ message: "Hi", author: DEFAULT_AUTHOR }),
      );

      return new Response(JSON.stringify(sampleMessage), { status: 201 });
    });

    const created = await createMessage({
      message: "Hi",
      author: DEFAULT_AUTHOR,
    });

    expect(created).toEqual(sampleMessage);
  });

  it("throws ApiError on 500", async () => {
    mockFetch(() => {
      return new Response(
        JSON.stringify({
          error: {
            message: "Internal Server Error",
            timestamp: "2024-01-01T00:00:00.000Z",
          },
        }),
        { status: 500 },
      );
    });

    await expect(
      createMessage({ message: "Hi", author: DEFAULT_AUTHOR }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
