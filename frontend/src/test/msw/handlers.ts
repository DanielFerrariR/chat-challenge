import { http, HttpResponse } from "msw";

import type { CreateMessageBody, Message } from "@/lib/api/types";

import { API_TOKEN, MESSAGES_URL } from "./constants";
import {
  getGetRequests,
  getMessageHandlerState,
  recordGetRequest,
  recordPostBody,
} from "./state";

function unauthorized() {
  return HttpResponse.json(
    { message: "Invalid token", statusCode: 401, error: "Unauthorized" },
    { status: 401 },
  );
}

function allMessagesChronological(): Message[] {
  const { older, initial, incoming = [] } = getMessageHandlerState();
  return [...older, ...initial, ...incoming].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function messagesAfter(after: string, limit: number): Message[] {
  const afterTime = new Date(after).getTime();
  return allMessagesChronological()
    .filter((message) => new Date(message.createdAt).getTime() > afterTime)
    .slice(0, limit);
}

export const handlers = [
  http.get(MESSAGES_URL, ({ request }) => {
    if (request.headers.get("Authorization") !== `Bearer ${API_TOKEN}`) {
      return unauthorized();
    }

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const after = url.searchParams.get("after");
    const { initial, older } = getMessageHandlerState();

    if (after) {
      recordGetRequest(request.url);
      return HttpResponse.json(messagesAfter(after, limit));
    }

    // First GET with `before` = latest window; later GETs with `before` = older history
    const beforeFetches = getGetRequests().filter(
      (entry) => entry.after == null && entry.before != null,
    );
    const isFirstWindow = beforeFetches.length === 0;
    recordGetRequest(request.url);

    const page = isFirstWindow ? initial : older;
    return HttpResponse.json(page.slice(0, limit));
  }),

  http.post(MESSAGES_URL, async ({ request }) => {
    if (request.headers.get("Authorization") !== `Bearer ${API_TOKEN}`) {
      return unauthorized();
    }

    const body = (await request.json()) as CreateMessageBody;
    recordPostBody(body);

    const created: Message = {
      _id: `created-${String(Date.now())}`,
      message: body.message,
      author: body.author,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(created, { status: 201 });
  }),
];
