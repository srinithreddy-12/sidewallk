export type MemberCategory = "art" | "craft" | "design" | "food" | "music" | "writing";

export type ExteriorKind = "gallery-front" | "studio-front" | "shop-front" | "cafe-front" | "press-front";

export type InteriorTemplate = "gallery" | "studio" | "shop";

export type RoomPropKind =
  | "framed-work"
  | "pedestal"
  | "shelf-display"
  | "product-table"
  | "booking-desk"
  | "plant"
  | "rug"
  | "lamp"
  | "bench";

export type PropMount = "floor" | "wall";

export interface PropDefinition {
  kind: RoomPropKind;
  label: string;
  mount: PropMount;
  /** Display props can carry content; decor cannot. */
  isDisplay: boolean;
  /** Footprint in grid cells, used for simple overlap avoidance in the editor. */
  footprint: { w: number; h: number };
}

/** Allowed outbound link protocols. Anything else is rejected at render and at save. */
export type AllowedLinkProtocol = "http:" | "https:" | "mailto:";

export interface MemberLink {
  id: string;
  label: string;
  url: string;
}

export interface PropContent {
  title: string;
  description: string;
  link?: MemberLink;
}

export interface RoomProp {
  id: string;
  kind: RoomPropKind;
  x: number;
  y: number;
  tone: string;
  content?: PropContent;
}

export interface Room {
  template: InteriorTemplate;
  palette: string;
  gridWidth: number;
  gridHeight: number;
  props: RoomProp[];
}

export interface Building {
  id: string;
  exterior: ExteriorKind;
  /** Position along the street, in street units, left to right. */
  position: number;
  bodyColor: string;
  trimColor: string;
  signText: string;
}

export interface Member {
  id: string;
  name: string;
  category: MemberCategory;
  tagline: string;
  description: string;
  action: MemberLink;
  building: Building;
  room: Room;
}

export interface Town {
  id: string;
  name: string;
  members: Member[];
}

/**
 * Edits to one member, keyed by member id in storage. Only fields the editor
 * actually changed are present — everything else keeps reading from demo data.
 * `room.props`, once set, is the full prop list (seeded from demo data on
 * first edit), not a diff.
 */
export interface MemberOverride {
  name?: string;
  category?: MemberCategory;
  tagline?: string;
  description?: string;
  action?: MemberLink;
  building?: Partial<Pick<Building, "bodyColor" | "trimColor" | "signText">>;
  room?: {
    template?: InteriorTemplate;
    palette?: string;
    props?: RoomProp[];
  };
}

export type OverrideMap = Record<string, MemberOverride>;
