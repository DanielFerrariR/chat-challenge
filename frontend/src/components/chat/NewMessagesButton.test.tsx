import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NewMessagesButton } from "./NewMessagesButton";

describe("NewMessagesButton", () => {
  it("renders nothing when count is zero", () => {
    const { container } = render(
      <NewMessagesButton count={0} onClick={vi.fn<() => void>()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows a label and calls onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();

    render(<NewMessagesButton count={3} onClick={onClick} />);

    await user.click(
      screen.getByRole("button", { name: "Jump to 3 new messages" }),
    );

    expect(onClick).toHaveBeenCalledOnce();
  });
});
