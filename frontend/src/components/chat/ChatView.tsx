"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api/errors";
import { useInfiniteMessages } from "@/hooks/useMessages";
import { useSendMessage } from "@/hooks/useSendMessage";

import { ChatEmptyState } from "./ChatEmptyState";
import { ChatShell } from "./ChatShell";
import { ComposeBar } from "./ComposeBar";
import { LoadOlderTrigger } from "./LoadOlderTrigger";
import { MessageBubble } from "./MessageBubble";
import { MessageList } from "./MessageList";
import { MessageListSkeleton } from "./MessageSkeleton";

export function ChatView() {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const scrollHeightBeforePrepend = useRef(0);
  const hasInitialScroll = useRef(false);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const setScrollContainer = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    setScrollRoot(node);
  }, []);

  const {
    messages,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isSuccess,
  } = useInfiniteMessages();

  const sendMessage = useSendMessage();

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    if (typeof element.scrollTo === "function") {
      element.scrollTo({ top: element.scrollHeight, behavior });
    } else {
      element.scrollTop = element.scrollHeight;
    }
  }, []);

  const handleLoadOlder = useCallback(() => {
    const element = scrollRef.current;
    if (!element || isFetchingNextPage || !hasNextPage) {
      return;
    }

    scrollHeightBeforePrepend.current = element.scrollHeight;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!isSuccess || isFetchingNextPage || messages.length === 0) {
      return;
    }

    if (scrollHeightBeforePrepend.current > 0) {
      const element = scrollRef.current;
      if (element) {
        const heightAdded = element.scrollHeight - scrollHeightBeforePrepend.current;
        element.scrollTop += heightAdded;
      }
      scrollHeightBeforePrepend.current = 0;
      return;
    }

    if (!hasInitialScroll.current) {
      scrollToBottom("instant");
      hasInitialScroll.current = true;
    }
  }, [isSuccess, isFetchingNextPage, messages, scrollToBottom]);

  useEffect(() => {
    if (sendMessage.isSuccess) {
      scrollToBottom();
      messageInputRef.current?.focus();
    }
  }, [sendMessage.isSuccess, messages.length, scrollToBottom]);

  const handleSubmit = () => {
    const text = draft.trim();
    if (text.length === 0 || sendMessage.isPending) {
      return;
    }

    sendMessage.mutate(text, {
      onSuccess: () => setDraft(""),
    });
  };

  const sendError =
    sendMessage.error instanceof ApiError
      ? sendMessage.error.message
      : sendMessage.error instanceof Error
        ? sendMessage.error.message
        : null;

  const loadError =
    error instanceof ApiError ? error.message : error?.message ?? null;

  return (
    <ChatShell>
      <h1 className="sr-only">Chat</h1>

      <MessageList scrollRef={setScrollContainer}>
        <LoadOlderTrigger
          scrollRoot={scrollRoot}
          onVisible={handleLoadOlder}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />

        {isPending ? <MessageListSkeleton /> : null}

        {isError ? (
          <li
            className="list-none rounded bg-white/90 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {loadError ?? "Could not load messages."}
          </li>
        ) : null}

        {isSuccess && !isError && messages.length === 0 ? (
          <ChatEmptyState />
        ) : null}

        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))}
      </MessageList>

      {sendError ? (
        <p className="bg-chat-footer px-4 py-1 text-center text-sm text-white" role="alert">
          {sendError}
        </p>
      ) : null}

      <ComposeBar
        ref={messageInputRef}
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        disabled={sendMessage.isPending}
      />
    </ChatShell>
  );
}
