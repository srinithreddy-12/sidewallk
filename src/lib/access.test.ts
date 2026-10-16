import { describe, expect, it } from "vitest";
import { authorizeTownAction, type TownAction, type ViewerContext } from "./access";

const townId = "town-one";
const ownMemberId = "member-one";

const visitor: ViewerContext = { userId: null };
const outsider: ViewerContext = { userId: "user-outside" };
const organizer: ViewerContext = {
  userId: "user-organizer",
  membership: { townId, userId: "user-organizer", role: "organizer", status: "active" },
};
const member: ViewerContext = {
  userId: "user-member",
  membership: { townId, userId: "user-member", role: "member", status: "active", memberId: ownMemberId },
};

function decide(viewer: ViewerContext, action: TownAction, memberId?: string) {
  return authorizeTownAction({ action, townId, publicationStatus: "draft", viewer, memberId });
}

describe("authorizeTownAction", () => {
  it("lets anyone view a published town", () => {
    for (const viewer of [visitor, outsider, organizer, member]) {
      expect(authorizeTownAction({ action: "view-town", townId, publicationStatus: "published", viewer })).toEqual({ allowed: true });
    }
  });

  it("keeps drafts private to active town memberships", () => {
    expect(decide(visitor, "view-town")).toEqual({ allowed: false, reason: "town-not-published" });
    expect(decide(outsider, "view-town")).toEqual({ allowed: false, reason: "membership-required" });
    expect(decide(organizer, "view-town")).toEqual({ allowed: true });
    expect(decide(member, "view-town")).toEqual({ allowed: true });
  });

  it("reserves town administration for organizers", () => {
    for (const action of ["edit-town", "publish-town", "invite-members"] satisfies TownAction[]) {
      expect(decide(organizer, action)).toEqual({ allowed: true });
      expect(decide(member, action)).toEqual({ allowed: false, reason: "organizer-required" });
    }
  });

  it("lets members edit and upload only for their assigned building", () => {
    for (const action of ["edit-member", "upload-member-assets"] satisfies TownAction[]) {
      expect(decide(member, action, ownMemberId)).toEqual({ allowed: true });
      expect(decide(member, action, "member-two")).toEqual({ allowed: false, reason: "member-mismatch" });
      expect(decide(organizer, action, "member-two")).toEqual({ allowed: true });
    }
  });

  it("does not treat invitations as active access", () => {
    const invited: ViewerContext = {
      userId: "user-invited",
      membership: { townId, userId: "user-invited", role: "member", status: "invited", memberId: ownMemberId },
    };
    expect(decide(invited, "view-town")).toEqual({ allowed: false, reason: "membership-not-active" });
    expect(decide(invited, "edit-member", ownMemberId)).toEqual({ allowed: false, reason: "membership-not-active" });
  });

  it("rejects a membership copied from another user or town", () => {
    const mismatchedUser: ViewerContext = { ...member, userId: "somebody-else" };
    const mismatchedTown: ViewerContext = {
      userId: "user-member",
      membership: { townId: "town-two", userId: "user-member", role: "member", status: "active", memberId: ownMemberId },
    };
    expect(decide(mismatchedUser, "edit-member", ownMemberId)).toEqual({ allowed: false, reason: "membership-required" });
    expect(decide(mismatchedTown, "edit-member", ownMemberId)).toEqual({ allowed: false, reason: "membership-required" });
  });

  it("requires an explicit member resource for member-scoped actions", () => {
    expect(decide(member, "edit-member")).toEqual({ allowed: false, reason: "member-required" });
    expect(decide(organizer, "upload-member-assets")).toEqual({ allowed: false, reason: "member-required" });
  });
});
