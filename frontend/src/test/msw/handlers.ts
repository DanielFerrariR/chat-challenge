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

export const handlers = [
  http.get(MESSAGES_URL, ({ request }) => {
    if (request.headers.get("Authorization") !== `Bearer ${API_TOKEN}`) {
      return unauthorized();
    }

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const { initial, older } = getMessageHandlerState();

    // First GET = latest window (before "now"); later GETs = older history
    const isFirstPage = getGetRequests().length === 0;
    recordGetRequest(request.url);

    const page = isFirstPage ? initial : older;
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
