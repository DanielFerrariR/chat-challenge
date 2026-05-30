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
  /** Messages returned only for `after` polls (simulates other senders). */
  incoming: Message[];
};

const defaultState = (): MessageHandlerState => ({
  initial: createSeedMessages(),
  older: olderMessages,
  incoming: [],
});

let state = defaultState();
let lastPostBody: CreateMessageBody | null = null;
const getRequests: {
  url: string;
  before?: string | null;
  after?: string | null;
  limit?: string | null;
}[] = [];

export function getMessageHandlerState(): MessageHandlerState {
  return state;
}

export function setMessageHandlerState(next: Partial<MessageHandlerState>): void {
  state = { ...state, ...next };
}

export function resetMessageHandlerState(
  next: Partial<MessageHandlerState> = {},
): void {
  state = { ...defaultState(), ...next };
  lastPostBody = null;
  getRequests.length = 0;
}

export function setFullPageWithOlderHistory(): void {
  resetMessageHandlerState({
    initial: createFullPageMessages(),
    older: olderMessages,
    incoming: [],
  });
}

export function getLastPostBody(): CreateMessageBody | null {
  return lastPostBody;
}

export function getGetRequests() {
  return [...getRequests];
}

export function pushIncomingMessage(message: Message): void {
  state.incoming.push(message);
}

export function recordGetRequest(url: string): void {
  const parsed = new URL(url);
  getRequests.push({
    url,
    before: parsed.searchParams.get("before"),
    after: parsed.searchParams.get("after"),
    limit: parsed.searchParams.get("limit"),
  });
}

export function recordPostBody(body: CreateMessageBody): void {
  lastPostBody = body;
}
