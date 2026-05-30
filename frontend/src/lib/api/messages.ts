import { env } from "@/lib/env";

import { parseApiError } from "./errors";
import type {
  CreateMessageBody,
  GetMessagesParams,
  Message,
} from "./types";

export const MESSAGES_PATH = "/api/v1/messages";
export const DEFAULT_AUTHOR = "John Doe";

function buildMessagesUrl(params?: GetMessagesParams): string {
  const url = new URL(`${env.apiBaseUrl}${MESSAGES_PATH}`);

  if (params?.limit !== undefined) {
    url.searchParams.set("limit", String(params.limit));
  }
  if (params?.after !== undefined) {
    url.searchParams.set("after", params.after);
  }
  if (params?.before !== undefined) {
    url.searchParams.set("before", params.before);
  }

  return url.toString();
}

async function fetchWithAuth<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${env.apiToken}`);

  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<T>;
}

export async function getMessages(
  params?: GetMessagesParams,
): Promise<Message[]> {
  return fetchWithAuth<Message[]>(buildMessagesUrl(params));
}

export async function createMessage(
  body: CreateMessageBody,
): Promise<Message> {
  return fetchWithAuth<Message>(`${env.apiBaseUrl}${MESSAGES_PATH}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
