/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_TOWN } from "@/lib/demo-data";
import { WorkspaceMemberEditor } from "./WorkspaceMemberEditor";

const mocks = vi.hoisted(() => ({
  updateMemberAction: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/app/workspace/towns/[townId]/actions", () => ({
  updateMemberAction: mocks.updateMemberAction,
}));
vi.mock("@/components/interior/RoomScene", () => ({ RoomScene: () => <div>Room preview</div> }));
vi.mock("@/components/editor/EditorPanel", () => ({
  EditorPanel: ({
    member,
    onPatch,
  }: {
    member: { name: string; description: string };
    onPatch: (patch: object) => void;
  }) => (
    <div>
      <output aria-label="current member">{`${member.name}|${member.description}`}</output>
      <button type="button" onClick={() => onPatch({ name: "Edited name" })}>Edit name</button>
      <button type="button" onClick={() => onPatch({ description: "Edited description" })}>Edit description</button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("WorkspaceMemberEditor save queue", () => {
  it("serializes rapid edits and advances the version before saving the newest snapshot", async () => {
    let resolveFirst!: (value: { ok: true; data: { version: number } }) => void;
    mocks.updateMemberAction
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockResolvedValueOnce({ ok: true, data: { version: 3 } });

    render(
      <WorkspaceMemberEditor
        townId="town-one"
        initialMember={DEMO_TOWN.members[0]!}
        initialVersion={1}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit name" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit description" }));

    expect(mocks.updateMemberAction).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("current member").textContent).toBe("Edited name|Edited description");

    resolveFirst({ ok: true, data: { version: 2 } });

    await waitFor(() => expect(mocks.updateMemberAction).toHaveBeenCalledTimes(2));
    expect(mocks.updateMemberAction.mock.calls[1]![2]).toMatchObject({
      name: "Edited name",
      description: "Edited description",
    });
    expect(mocks.updateMemberAction.mock.calls[1]![3]).toBe(2);
  });
});
