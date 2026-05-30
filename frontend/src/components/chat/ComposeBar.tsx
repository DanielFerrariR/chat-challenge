"use client";

import { forwardRef, type Ref } from "react";

type ComposeBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export const ComposeBar = forwardRef(function ComposeBar(
  {
    value,
    onChange,
    onSubmit,
    disabled = false,
  }: ComposeBarProps,
  ref: Ref<HTMLInputElement>,
) {
  return (
    <footer className="flex shrink-0 gap-3 bg-chat-footer px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <label className="sr-only" htmlFor="chat-message">
        Message
      </label>
      <input
        ref={ref}
        id="chat-message"
        type="text"
        value={value}
        placeholder="Message"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
        className="min-h-11 flex-1 rounded border border-chat-input-border bg-white px-3 text-chat-body placeholder:text-chat-placeholder focus:outline-none focus:ring-2 focus:ring-white/60 disabled:opacity-60"
      />
      <button
        type="button"
        aria-label="Send message"
        aria-busy={disabled}
        disabled={disabled || value.trim().length === 0}
        onClick={onSubmit}
        className="min-h-11 min-w-20 rounded bg-chat-send px-4 font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-chat-footer disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send
      </button>
    </footer>
  );
});
