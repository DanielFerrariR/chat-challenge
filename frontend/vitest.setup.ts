import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { server } from "./src/test/msw/server";
import { resetMessageHandlerState } from "./src/test/msw/state";

vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3000");
vi.stubEnv("NEXT_PUBLIC_API_TOKEN", "super-secret-doodle-token");

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  resetMessageHandlerState();
});

afterAll(() => {
  server.close();
});
