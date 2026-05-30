"use client";

type ComposeBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function ComposeBar({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: ComposeBarProps) {
  return (
    <footer className="flex shrink-0 gap-3 bg-chat-footer px-4 py-3">
      <label className="sr-only" htmlFor="chat-message">
        Message
      </label>
      <input
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
        disabled={disabled || value.trim().length === 0}
        onClick={onSubmit}
        className="min-h-11 min-w-20 rounded bg-chat-send px-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send
      </button>
    </footer>
  );
}
