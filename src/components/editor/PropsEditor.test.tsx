/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropsEditor } from "./PropsEditor";
import { TEMPLATE_PROP_PALETTE } from "@/lib/prop-registry";
import type { Room } from "@/lib/types";

afterEach(cleanup);

const galleryRoom: Room = {
  template: "gallery",
  palette: "#d8cdbb",
  gridWidth: 6,
  gridHeight: 5,
  props: [],
};

function noop() {}

describe("PropsEditor", () => {
  it("Add only ever inserts a kind that belongs to the current template's palette (regression)", () => {
    const onAddProp = vi.fn();
    const { rerender } = render(
      <PropsEditor room={galleryRoom} onMoveProp={noop} onRemoveProp={noop} onUpdatePropContent={noop} onAddProp={onAddProp} />,
    );

    // Default selection is the gallery palette's first entry, "Framed work".
    const select = screen.getByLabelText("Add furniture or decor") as HTMLSelectElement;
    expect(select.value).toBe("framed-work");

    // Switch the interior template to shop — "Framed work" is not in the shop palette.
    const shopRoom: Room = { ...galleryRoom, template: "shop" };
    rerender(
      <PropsEditor room={shopRoom} onMoveProp={noop} onRemoveProp={noop} onUpdatePropContent={noop} onAddProp={onAddProp} />,
    );

    // Click Add immediately — before any possible effect-driven correction.
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(onAddProp).toHaveBeenCalledTimes(1);
    const insertedKind = onAddProp.mock.calls[0]?.[0];
    expect(TEMPLATE_PROP_PALETTE.shop).toContain(insertedKind);
    expect(insertedKind).not.toBe("framed-work");
  });

  it("the select's displayed value also updates to a valid option after the template switch", () => {
    const shopRoom: Room = { ...galleryRoom, template: "shop" };
    render(<PropsEditor room={shopRoom} onMoveProp={noop} onRemoveProp={noop} onUpdatePropContent={noop} onAddProp={noop} />);

    const select = screen.getByLabelText("Add furniture or decor") as HTMLSelectElement;
    expect(TEMPLATE_PROP_PALETTE.shop).toContain(select.value);
  });
});
