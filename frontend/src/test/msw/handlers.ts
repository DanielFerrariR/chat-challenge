import { http, HttpResponse } from "msw";

import type { CreateMessageBody, Message } from "@/lib/api/types";

import { API_TOKEN, MESSAGES_URL } from "./constants";
import {
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

export const handlers = [
  http.get(MESSAGES_URL, ({ request }) => {
    if (request.headers.get("Authorization") !== `Bearer ${API_TOKEN}`) {
      return unauthorized();
    }

    recordGetRequest(request.url);

    const url = new URL(request.url);
    const before = url.searchParams.get("before");
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const { initial, older } = getMessageHandlerState();

    const page = before ? older : initial;
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
