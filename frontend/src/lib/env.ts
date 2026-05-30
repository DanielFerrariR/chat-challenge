const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const API_TOKEN =
  process.env.NEXT_PUBLIC_API_TOKEN ?? "super-secret-doodle-token";

export const env = {
  apiBaseUrl: API_BASE_URL.replace(/\/$/, ""),
  apiToken: API_TOKEN,
} as const;
