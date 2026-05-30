import type { CreateMessageBody } from "@/lib/api/types";
import type { Message } from "@/lib/api/types";

import {
  createFullPageMessages,
  createSeedMessages,
  olderMessages,
} from "./fixtures";

export type MessageHandlerState = {
  initial: Message[];
  older: Message[];
};

const defaultState = (): MessageHandlerState => ({
  initial: createSeedMessages(),
  older: olderMessages,
});

let state = defaultState();
let lastPostBody: CreateMessageBody | null = null;
const getRequests: { url: string; before?: string | null; limit?: string | null }[] =
  [];

export function getMessageHandlerState(): MessageHandlerState {
  return state;
}

export function setMessageHandlerState(next: Partial<MessageHandlerState>): void {
  state = { ...state, ...next };
}

export function resetMessageHandlerState(
  next: MessageHandlerState = defaultState(),
): void {
  state = next;
  lastPostBody = null;
  getRequests.length = 0;
}

export function setFullPageWithOlderHistory(): void {
  resetMessageHandlerState({
    initial: createFullPageMessages(),
    older: olderMessages,
  });
}

export function getLastPostBody(): CreateMessageBody | null {
  return lastPostBody;
}

export function getGetRequests() {
  return [...getRequests];
}

export function recordGetRequest(url: string): void {
  const parsed = new URL(url);
  getRequests.push({
    url,
    before: parsed.searchParams.get("before"),
    limit: parsed.searchParams.get("limit"),
  });
}

export function recordPostBody(body: CreateMessageBody): void {
  lastPostBody = body;
}
