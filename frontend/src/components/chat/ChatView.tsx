"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api/errors";
import { useInfiniteMessages } from "@/hooks/useMessages";
import { usePollNewMessages } from "@/hooks/usePollNewMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { isMessagePollingEnabled } from "@/hooks/queryKeys";

import { ChatEmptyState } from "./ChatEmptyState";
import { ChatShell } from "./ChatShell";
import { ComposeBar } from "./ComposeBar";
import { LoadOlderTrigger } from "./LoadOlderTrigger";
import { MessageBubble } from "./MessageBubble";
import { MessageList } from "./MessageList";
import { MessageListSkeleton } from "./MessageSkeleton";
import { NewMessagesButton } from "./NewMessagesButton";

type ChatViewProps = {
  /** Test-only override; production uses `isMessagePollingEnabled`. */
  enableMessagePolling?: boolean;
};

export function ChatView({
  enableMessagePolling = isMessagePollingEnabled,
}: ChatViewProps = {}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const scrollHeightBeforePrepend = useRef(0);
  const hasInitialScroll = useRef(false);
  const previousMessageCount = useRef(0);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const isNearBottom = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return true;
    }

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    return distanceFromBottom < 80;
  }, []);

  const setScrollContainer = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    setScrollRoot(node);
    isNearBottomRef.current = isNearBottom();
  }, [isNearBottom]);

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

  const { bufferedCount, flushBufferedMessages } = usePollNewMessages({
    enabled: enableMessagePolling && isSuccess,
    isNearBottomRef,
  });

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

    isNearBottomRef.current = true;
  }, []);

  const handleJumpToNewMessages = useCallback(() => {
    flushBufferedMessages();
    scrollToBottom("instant");
  }, [flushBufferedMessages, scrollToBottom]);

  const handleLoadOlder = useCallback(() => {
    const element = scrollRef.current;
    if (!element || isFetchingNextPage || !hasNextPage) {
      return;
    }

    scrollHeightBeforePrepend.current = element.scrollHeight;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useLayoutEffect(() => {
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
      previousMessageCount.current = messages.length;
      return;
    }

    const addedCount = messages.length - previousMessageCount.current;
    // Use the ref (sticky-bottom intent before this render), not isNearBottom():
    // after appending messages the list is taller so a live measurement reads "not at bottom".
    if (addedCount > 0 && isNearBottomRef.current) {
      scrollToBottom("instant");
      requestAnimationFrame(() => {
        if (isNearBottomRef.current) {
          scrollToBottom("instant");
        }
      });
    }

    previousMessageCount.current = messages.length;
  }, [isSuccess, isFetchingNextPage, messages, scrollToBottom]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const handleScroll = () => {
      isNearBottomRef.current = isNearBottom();
      if (isNearBottomRef.current) {
        flushBufferedMessages();
        scrollToBottom("instant");
      }
    };

    element.addEventListener("scroll", handleScroll, { passive: true });
    return () => element.removeEventListener("scroll", handleScroll);
  }, [scrollRoot, isNearBottom, flushBufferedMessages, scrollToBottom]);

  useEffect(() => {
    if (sendMessage.isSuccess) {
      flushBufferedMessages();
      scrollToBottom("instant");
      messageInputRef.current?.focus();
    }
  }, [sendMessage.isSuccess, messages.length, scrollToBottom, flushBufferedMessages]);

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

      <div className="relative flex min-h-0 flex-1 flex-col">
        <NewMessagesButton
          count={bufferedCount}
          onClick={handleJumpToNewMessages}
        />

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
      </div>

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
