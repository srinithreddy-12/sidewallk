/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TownManagementControls } from "./TownManagementControls";

const mocks = vi.hoisted(() => ({
  updateTownNameAction: vi.fn(),
  publishTownAction: vi.fn(),
  unpublishTownAction: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/app/workspace/towns/[townId]/actions", () => ({
  updateTownNameAction: mocks.updateTownNameAction,
  publishTownAction: mocks.publishTownAction,
  unpublishTownAction: mocks.unpublishTownAction,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("TownManagementControls", () => {
  it("shares the latest version and blocks overlapping town mutations", async () => {
    let resolveNameSave!: (value: { ok: true; data: { version: number } }) => void;
    mocks.updateTownNameAction.mockImplementationOnce(
      () => new Promise((resolve) => { resolveNameSave = resolve; }),
    );
    mocks.publishTownAction.mockResolvedValueOnce({
      ok: true,
      data: { version: 3, publishedAt: "2026-10-24T00:00:00.000Z" },
    });

    render(
      <TownManagementControls
        townId="town-one"
        townName="Old name"
        townSlug="town-one"
        initialPublished={false}
        initialVersion={1}
      />,
    );

    fireEvent.change(screen.getByLabelText("Town name"), { target: { value: "New name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save name" }));

    const publishButton = screen.getByRole("button", { name: "Working…" }) as HTMLButtonElement;
    expect(publishButton.disabled).toBe(true);
    fireEvent.click(publishButton);
    expect(mocks.publishTownAction).not.toHaveBeenCalled();

    resolveNameSave({ ok: true, data: { version: 2 } });
    await waitFor(() => expect((screen.getByRole("button", { name: "Publish town" }) as HTMLButtonElement).disabled).toBe(false));

    fireEvent.click(screen.getByRole("button", { name: "Publish town" }));
    await waitFor(() => expect(mocks.publishTownAction).toHaveBeenCalledWith("town-one", 2));
  });
});
