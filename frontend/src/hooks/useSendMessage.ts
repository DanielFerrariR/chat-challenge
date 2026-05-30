"use client";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { createMessage, DEFAULT_AUTHOR } from "@/lib/api/messages";
import type { Message } from "@/lib/api/types";

import { messagesQueryKey } from "./queryKeys";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => {
      const message = text.trim();
      if (message.length === 0) {
        throw new Error("Message cannot be empty");
      }

      return createMessage({ message, author: DEFAULT_AUTHOR });
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<InfiniteData<Message[]>>(
        messagesQueryKey,
        (current) => {
          if (!current?.pages.length) {
            return current;
          }

          const pages = current.pages.map((page, index) =>
            index === current.pages.length - 1
              ? [...page, newMessage]
              : page,
          );

          return { ...current, pages };
        },
      );
    },
  });
}
