/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropEditor } from "./PropEditor";
import type { RoomProp } from "@/lib/types";

afterEach(cleanup);

const basePedestal: RoomProp = {
  id: "shared-prop-id",
  kind: "pedestal",
  x: 0,
  y: 0,
  tone: "#b7a888",
  content: { title: "Original title", description: "Original description" },
};

describe("PropEditor", () => {
  it("commits an edited title via onUpdateContent", () => {
    const onUpdateContent = vi.fn();
    render(
      <PropEditor prop={basePedestal} onMove={vi.fn()} onRemove={vi.fn()} onUpdateContent={onUpdateContent} />,
    );

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Edited title" } });

    expect(onUpdateContent).toHaveBeenCalledWith({
      title: "Edited title",
      description: "Original description",
      linkLabel: "",
      linkUrl: "",
    });
  });

  it("reflects a reset in the mounted UI instead of keeping stale edited text (regression)", () => {
    const onUpdateContent = vi.fn();
    const { rerender } = render(
      <PropEditor prop={basePedestal} onMove={vi.fn()} onRemove={vi.fn()} onUpdateContent={onUpdateContent} />,
    );

    // Edit the title, as a user would before clicking "Reset to demo data".
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Edited title" } });

    // "Reset to demo data": the parent passes a prop with the SAME id (React keeps this
    // component mounted, same as in the real editor list) but the original demo content.
    const resetProp: RoomProp = { ...basePedestal, content: { title: "Original title", description: "Original description" } };
    rerender(<PropEditor prop={resetProp} onMove={vi.fn()} onRemove={vi.fn()} onUpdateContent={onUpdateContent} />);

    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("Original title");

    // Editing a different field afterwards must not resurrect the stale edited title.
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "New description" } });
    expect(onUpdateContent).toHaveBeenLastCalledWith({
      title: "Original title",
      description: "New description",
      linkLabel: "",
      linkUrl: "",
    });
  });
});
