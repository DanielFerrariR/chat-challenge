export const MESSAGES_PAGE_SIZE = 20;

/** Larger window for `after` polls so buffered catch-up needs fewer round-trips. */
export const MESSAGES_POLL_LIMIT = 100;

export const messagesQueryKey = ["messages", MESSAGES_PAGE_SIZE] as const;

export const messagesPollQueryKey = [...messagesQueryKey, "poll"] as const;

/** Disabled under Vitest so existing tests stay free of background polls. */
export const isMessagePollingEnabled = process.env.VITEST !== "true";
