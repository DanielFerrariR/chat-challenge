import { DEFAULT_AUTHOR } from "@/lib/api/messages";
import type { Message } from "@/lib/api/types";
import { decodeHtml } from "@/lib/decodeHtml";
import { formatTimestamp } from "@/lib/formatTimestamp";

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isSent = message.author === DEFAULT_AUTHOR;
  const body = decodeHtml(message.message);
  const timestamp = formatTimestamp(message.createdAt);

  if (isSent) {
    return (
      <li className="flex justify-end">
        <article className="max-w-chat-bubble rounded bg-chat-sent px-4 py-4 shadow-sm">
          <p className="text-chat-body whitespace-pre-wrap">{body}</p>
          <time
            dateTime={message.createdAt}
            className="mt-2 block text-right text-sm text-chat-meta"
          >
            {timestamp}
          </time>
        </article>
      </li>
    );
  }

  return (
    <li className="flex justify-start">
      <article className="max-w-chat-bubble rounded bg-white px-4 py-4 shadow-sm">
        <p className="text-sm text-chat-meta">{message.author}</p>
        <p className="mt-1 text-chat-body whitespace-pre-wrap">{body}</p>
        <time
          dateTime={message.createdAt}
          className="mt-2 block text-sm text-chat-meta"
        >
          {timestamp}
        </time>
      </article>
    </li>
  );
}
