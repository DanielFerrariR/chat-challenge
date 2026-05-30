type NewMessagesButtonProps = {
  count: number;
  onClick: () => void;
};

export function NewMessagesButton({ count, onClick }: NewMessagesButtonProps) {
  if (count <= 0) {
    return null;
  }

  const label =
    count === 1 ? "1 new message" : `${String(count)} new messages`;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-4 pt-2">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Jump to ${label}`}
        className="pointer-events-auto rounded-full bg-chat-send px-4 py-2 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-transparent"
      >
        {label}
      </button>
    </div>
  );
}
