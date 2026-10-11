import type { Member, MemberLink, PropContent, RoomProp, Town } from "./types";

function link(id: string, label: string, url: string): MemberLink {
  return { id, label, url };
}

function content(title: string, description: string, link?: MemberLink): PropContent {
  return link ? { title, description, link } : { title, description };
}

function prop(
  id: string,
  kind: RoomProp["kind"],
  x: number,
  y: number,
  tone: string,
  propContent?: PropContent,
): RoomProp {
  return propContent ? { id, kind, x, y, tone, content: propContent } : { id, kind, x, y, tone };
}

const GALLERY_WALL = "#d8cdbb";
const STUDIO_WALL = "#e4dac8";
const SHOP_WALL = "#ded0b8";

const papermoth: Member = {
  id: "papermoth-press",
  name: "Papermoth Press",
  category: "art",
  tagline: "Risograph prints and hand-bound books.",
  description:
    "Sample member. Papermoth Press is a one-room print studio making small-run riso prints, zines and hand-bound books, each one numbered and signed.",
  action: link("papermoth-action", "Visit the current show", "https://papermoth.example/visit"),
  building: {
    id: "papermoth-building",
    exterior: "press-front",
    position: 0,
    bodyColor: "#c97b5f",
    trimColor: "#f3e3c8",
    signText: "Papermoth Press",
  },
  room: {
    template: "gallery",
    palette: GALLERY_WALL,
    gridWidth: 6,
    gridHeight: 5,
    props: [
      prop(
        "papermoth-frame-1",
        "framed-work",
        1,
        0,
        "#2d2a26",
        content(
          "Low Tide, riso print",
          "Three-layer riso print on cream stock, edition of 40. Sample artwork for this demo.",
          link("papermoth-link-1", "See the print", "https://papermoth.example/prints/low-tide"),
        ),
      ),
      prop(
        "papermoth-frame-2",
        "framed-work",
        3,
        0,
        "#2d2a26",
        content(
          "Field Notes, zine cover",
          "Cover art for a hand-stitched zine about neighbourhood walks. Sample artwork for this demo.",
          link("papermoth-link-2", "Read about the zine", "https://papermoth.example/zines/field-notes"),
        ),
      ),
      prop(
        "papermoth-frame-3",
        "framed-work",
        5,
        0,
        "#2d2a26",
        content(
          "Night Market, riso print",
          "Two-colour riso print, edition of 60. Sample artwork for this demo.",
          link("papermoth-link-3", "See the print", "https://papermoth.example/prints/night-market"),
        ),
      ),
      prop(
        "papermoth-pedestal",
        "pedestal",
        2,
        4,
        "#b7a888",
        content(
          "Hand-bound book, 'Low Light'",
          "A thread-bound photo book, 48 pages, printed on uncoated stock. Sample artwork for this demo.",
          link("papermoth-link-4", "Read a sample page", "https://papermoth.example/books/low-light"),
        ),
      ),
      prop("papermoth-rug", "rug", 1, 3, "#8a6a52"),
      prop("papermoth-bench", "bench", 3, 4, "#6b5440"),
      prop("papermoth-plant", "plant", 0, 2, "#4d6b4a"),
      prop("papermoth-lamp", "lamp", 5, 2, "#caa968"),
    ],
  },
};

const lindenAndKiln: Member = {
  id: "linden-and-kiln",
  name: "Linden & Kiln",
  category: "craft",
  tagline: "Wheel-thrown ceramics, taught and sold from one studio.",
  description:
    "Sample member. Linden & Kiln is a ceramics studio offering wheel-throwing classes and selling small batches of glazed tableware.",
  action: link("linden-action", "Book a studio visit", "https://lindenandkiln.example/book"),
  building: {
    id: "linden-building",
    exterior: "studio-front",
    position: 1,
    bodyColor: "#8c7a5e",
    trimColor: "#eee3cf",
    signText: "Linden & Kiln",
  },
  room: {
    template: "studio",
    palette: STUDIO_WALL,
    gridWidth: 6,
    gridHeight: 5,
    props: [
      prop(
        "linden-shelf-1",
        "shelf-display",
        1,
        0,
        "#a9754f",
        content(
          "Glazed stoneware mugs",
          "Six-piece set, reactive glaze, microwave and dishwasher safe. Sample catalogue item.",
          link("linden-link-1", "View the set", "https://lindenandkiln.example/shop/mug-set"),
        ),
      ),
      prop(
        "linden-shelf-2",
        "shelf-display",
        4,
        0,
        "#a9754f",
        content(
          "Serving bowls, ash glaze",
          "Hand-thrown serving bowls finished in a wood-ash glaze. Sample catalogue item.",
          link("linden-link-2", "View the bowls", "https://lindenandkiln.example/shop/ash-bowls"),
        ),
      ),
      prop(
        "linden-desk",
        "booking-desk",
        2,
        3,
        "#6b5440",
        content(
          "Beginner wheel-throwing class",
          "A two-hour small-group class covering centring and your first bowl. Sample booking item.",
          link("linden-link-3", "Book this class", "https://lindenandkiln.example/classes/beginner-wheel"),
        ),
      ),
      prop(
        "linden-framed",
        "framed-work",
        0,
        0,
        "#2d2a26",
        content(
          "Studio glaze chart",
          "A reference sheet of the studio's six house glazes. Sample artwork for this demo.",
          link("linden-link-4", "See all glazes", "https://lindenandkiln.example/glazes"),
        ),
      ),
      prop("linden-rug", "rug", 3, 3, "#9c7b52"),
      prop("linden-plant", "plant", 5, 2, "#4d6b4a"),
      prop("linden-lamp", "lamp", 0, 2, "#caa968"),
    ],
  },
};

const harborLightGoods: Member = {
  id: "harbor-light-goods",
  name: "Harbor Light Goods",
  category: "design",
  tagline: "Small-batch home goods, designed and finished by hand.",
  description:
    "Sample member. Harbor Light Goods designs and finishes candles, linen and small hardware for the home, sold in short runs.",
  action: link("harbor-action", "Shop the collection", "https://harborlightgoods.example/shop"),
  building: {
    id: "harbor-building",
    exterior: "shop-front",
    position: 2,
    bodyColor: "#3f6e6a",
    trimColor: "#eee3cf",
    signText: "Harbor Light Goods",
  },
  room: {
    template: "shop",
    palette: SHOP_WALL,
    gridWidth: 6,
    gridHeight: 5,
    props: [
      prop(
        "harbor-table-1",
        "product-table",
        1,
        2,
        "#b58a55",
        content(
          "Beeswax taper candles",
          "Hand-dipped taper candles in three warm tones, sold in pairs. Sample catalogue item.",
          link("harbor-link-1", "View candles", "https://harborlightgoods.example/shop/tapers"),
        ),
      ),
      prop(
        "harbor-table-2",
        "product-table",
        4,
        2,
        "#b58a55",
        content(
          "Washed linen napkins",
          "Stone-washed linen napkins, set of four, in sand and clay. Sample catalogue item.",
          link("harbor-link-2", "View napkins", "https://harborlightgoods.example/shop/napkins"),
        ),
      ),
      prop(
        "harbor-shelf",
        "shelf-display",
        1,
        0,
        "#8a6a52",
        content(
          "Cast brass hooks",
          "Small cast-brass wall hooks, sold individually. Sample catalogue item.",
          link("harbor-link-3", "View hooks", "https://harborlightgoods.example/shop/brass-hooks"),
        ),
      ),
      prop(
        "harbor-pedestal",
        "pedestal",
        3,
        0,
        "#b7a888",
        content(
          "Stoneware oil cruet",
          "A single-pour oil cruet in a matte glaze. Sample catalogue item.",
          link("harbor-link-4", "View cruet", "https://harborlightgoods.example/shop/oil-cruet"),
        ),
      ),
      prop("harbor-rug", "rug", 2, 3, "#9c7b52"),
      prop("harbor-bench", "bench", 5, 1, "#6b5440"),
      prop("harbor-plant", "plant", 0, 1, "#4d6b4a"),
      prop("harbor-lamp", "lamp", 5, 3, "#caa968"),
    ],
  },
};

const marrowCoffeeRoastery: Member = {
  id: "marrow-coffee-roastery",
  name: "Marrow Coffee Roastery",
  category: "food",
  tagline: "Small-batch beans, roasted weekly.",
  description:
    "Sample member. Marrow Coffee Roastery roasts small batches of single-origin coffee each week and ships bags within a day of roasting.",
  action: link("marrow-action", "Order this week's roast", "https://marrowroastery.example/order"),
  building: {
    id: "marrow-building",
    exterior: "cafe-front",
    position: 3,
    bodyColor: "#8a4a3a",
    trimColor: "#f3e3c8",
    signText: "Marrow Coffee",
  },
  room: {
    template: "shop",
    palette: SHOP_WALL,
    gridWidth: 6,
    gridHeight: 5,
    props: [
      prop(
        "marrow-table-1",
        "product-table",
        1,
        2,
        "#b58a55",
        content(
          "Highland Reserve, 250g",
          "Washed highland arabica, roasted for filter. Notes of stone fruit and brown sugar. Sample catalogue item.",
          link("marrow-link-1", "Order Highland Reserve", "https://marrowroastery.example/beans/highland-reserve"),
        ),
      ),
      prop(
        "marrow-table-2",
        "product-table",
        4,
        2,
        "#b58a55",
        content(
          "Low Valley Dark, 250g",
          "A darker roast built for espresso, notes of cocoa and dried cherry. Sample catalogue item.",
          link("marrow-link-2", "Order Low Valley Dark", "https://marrowroastery.example/beans/low-valley-dark"),
        ),
      ),
      prop(
        "marrow-shelf",
        "shelf-display",
        1,
        0,
        "#8a6a52",
        content(
          "This week's roast log",
          "A running log of roast dates, origins and cupping notes. Sample catalogue item.",
          link("marrow-link-3", "Read the roast log", "https://marrowroastery.example/roast-log"),
        ),
      ),
      prop(
        "marrow-framed",
        "framed-work",
        4,
        0,
        "#2d2a26",
        content(
          "Origin map",
          "A hand-drawn map of this season's growing regions. Sample artwork for this demo.",
          link("marrow-link-4", "See the origins", "https://marrowroastery.example/origins"),
        ),
      ),
      prop("marrow-rug", "rug", 2, 3, "#9c7b52"),
      prop("marrow-bench", "bench", 5, 1, "#6b5440"),
      prop("marrow-plant", "plant", 0, 1, "#4d6b4a"),
      prop("marrow-lamp", "lamp", 5, 3, "#caa968"),
    ],
  },
};

const thistleAndThread: Member = {
  id: "thistle-and-thread",
  name: "Thistle & Thread",
  category: "craft",
  tagline: "Naturally dyed textiles, woven to order.",
  description:
    "Sample member. Thistle & Thread hand-weaves scarves and throws using plant-dyed wool, each piece made to order in small batches.",
  action: link("thistle-action", "Shop the loom", "https://thistleandthread.example/shop"),
  building: {
    id: "thistle-building",
    exterior: "shop-front",
    position: 4,
    bodyColor: "#6a4f6b",
    trimColor: "#eee3cf",
    signText: "Thistle & Thread",
  },
  room: {
    template: "shop",
    palette: SHOP_WALL,
    gridWidth: 6,
    gridHeight: 5,
    props: [
      prop(
        "thistle-table-1",
        "product-table",
        1,
        2,
        "#b58a55",
        content(
          "Madder-dyed wool scarf",
          "Hand-woven merino scarf, dyed with madder root. Sample catalogue item.",
          link("thistle-link-1", "View scarf", "https://thistleandthread.example/shop/madder-scarf"),
        ),
      ),
      prop(
        "thistle-table-2",
        "product-table",
        4,
        2,
        "#b58a55",
        content(
          "Indigo lap throw",
          "A woven lap throw dyed in small indigo batches, each one slightly different. Sample catalogue item.",
          link("thistle-link-2", "View throw", "https://thistleandthread.example/shop/indigo-throw"),
        ),
      ),
      prop(
        "thistle-shelf",
        "shelf-display",
        1,
        0,
        "#8a6a52",
        content(
          "Dye swatch wall",
          "Swatches from this season's plant-dye batches: madder, indigo, and weld. Sample catalogue item.",
          link("thistle-link-3", "See the swatches", "https://thistleandthread.example/dye-notes"),
        ),
      ),
      prop(
        "thistle-pedestal",
        "pedestal",
        4,
        0,
        "#b7a888",
        content(
          "Skeins, undyed wool",
          "Undyed local wool, available by the skein for your own project. Sample catalogue item.",
          link("thistle-link-4", "View skeins", "https://thistleandthread.example/shop/skeins"),
        ),
      ),
      prop("thistle-rug", "rug", 2, 3, "#9c7b52"),
      prop("thistle-bench", "bench", 5, 1, "#6b5440"),
      prop("thistle-plant", "plant", 0, 1, "#4d6b4a"),
      prop("thistle-lamp", "lamp", 5, 3, "#caa968"),
    ],
  },
};

const needleAndGroove: Member = {
  id: "needle-and-groove",
  name: "Needle & Groove",
  category: "music",
  tagline: "Record lessons and a crate of staff picks.",
  description:
    "Sample member. Needle & Groove gives weekly guitar and bass lessons and keeps a small crate of staff-picked records for sale.",
  action: link("needle-action", "Book a lesson", "https://needleandgroove.example/lessons"),
  building: {
    id: "needle-building",
    exterior: "studio-front",
    position: 5,
    bodyColor: "#3a4e6a",
    trimColor: "#f3e3c8",
    signText: "Needle & Groove",
  },
  room: {
    template: "studio",
    palette: STUDIO_WALL,
    gridWidth: 6,
    gridHeight: 5,
    props: [
      prop(
        "needle-shelf-1",
        "shelf-display",
        1,
        0,
        "#a9754f",
        content(
          "This month's staff picks",
          "A rotating crate of eight records, picked and annotated by the studio's teachers. Sample catalogue item.",
          link("needle-link-1", "Browse the crate", "https://needleandgroove.example/crate"),
        ),
      ),
      prop(
        "needle-shelf-2",
        "shelf-display",
        4,
        0,
        "#a9754f",
        content(
          "House strings and picks",
          "A small shelf of strings, picks and capos for lesson-day emergencies. Sample catalogue item.",
          link("needle-link-2", "View supplies", "https://needleandgroove.example/shop/supplies"),
        ),
      ),
      prop(
        "needle-desk",
        "booking-desk",
        2,
        3,
        "#6b5440",
        content(
          "Weekly guitar lesson",
          "A 45-minute one-on-one lesson, beginner through intermediate. Sample booking item.",
          link("needle-link-3", "Book a lesson", "https://needleandgroove.example/lessons/guitar"),
        ),
      ),
      prop(
        "needle-framed",
        "framed-work",
        0,
        0,
        "#2d2a26",
        content(
          "Lesson room schedule",
          "This week's open lesson slots across guitar and bass. Sample artwork for this demo.",
          link("needle-link-4", "See open slots", "https://needleandgroove.example/schedule"),
        ),
      ),
      prop("needle-rug", "rug", 3, 3, "#9c7b52"),
      prop("needle-plant", "plant", 5, 2, "#4d6b4a"),
      prop("needle-lamp", "lamp", 0, 2, "#caa968"),
    ],
  },
};

const birchAndVellum: Member = {
  id: "birch-and-vellum-studio",
  name: "Birch & Vellum Studio",
  category: "design",
  tagline: "Editorial illustration for small publishers.",
  description:
    "Sample member. Birch & Vellum Studio illustrates covers and spot art for small publishers, usually in gouache and coloured pencil.",
  action: link("birch-action", "Enquire about a commission", "mailto:hello@birchandvellum.example"),
  building: {
    id: "birch-building",
    exterior: "gallery-front",
    position: 6,
    bodyColor: "#b08a3e",
    trimColor: "#f3e3c8",
    signText: "Birch & Vellum",
  },
  room: {
    template: "gallery",
    palette: GALLERY_WALL,
    gridWidth: 6,
    gridHeight: 5,
    props: [
      prop(
        "birch-frame-1",
        "framed-work",
        1,
        0,
        "#2d2a26",
        content(
          "Cover art, 'The Long Orchard'",
          "Gouache cover illustration for a small-press novel. Sample artwork for this demo.",
          link("birch-link-1", "See the full cover", "https://birchandvellum.example/work/long-orchard"),
        ),
      ),
      prop(
        "birch-frame-2",
        "framed-work",
        3,
        0,
        "#2d2a26",
        content(
          "Spot art set, quarterly journal",
          "A set of six spot illustrations for a quarterly literary journal. Sample artwork for this demo.",
          link("birch-link-2", "See the set", "https://birchandvellum.example/work/journal-spots"),
        ),
      ),
      prop(
        "birch-frame-3",
        "framed-work",
        5,
        0,
        "#2d2a26",
        content(
          "Cover art, 'Harbour Light'",
          "Coloured-pencil cover illustration for a poetry chapbook. Sample artwork for this demo.",
          link("birch-link-3", "See the full cover", "https://birchandvellum.example/work/harbour-light"),
        ),
      ),
      prop(
        "birch-pedestal",
        "pedestal",
        2,
        3,
        "#b7a888",
        content(
          "Sketchbook, open",
          "A current sketchbook page of character studies for an upcoming commission. Sample artwork for this demo.",
          link("birch-link-4", "See more sketches", "https://birchandvellum.example/sketchbook"),
        ),
      ),
      prop("birch-rug", "rug", 1, 3, "#8a6a52"),
      prop("birch-bench", "bench", 4, 3, "#6b5440"),
      prop("birch-plant", "plant", 0, 2, "#4d6b4a"),
      prop("birch-lamp", "lamp", 5, 2, "#caa968"),
    ],
  },
};

const saltCityLetterpress: Member = {
  id: "salt-city-letterpress",
  name: "Salt City Letterpress",
  category: "writing",
  tagline: "Letterpress invitations and broadsides, set by hand.",
  description:
    "Sample member. Salt City Letterpress hand-sets type for wedding invitations, broadsides and short-run chapbooks on a century-old press.",
  action: link(
    "salt-action",
    "Enquire about a print run",
    "https://saltcityletterpress.example/commission",
  ),
  building: {
    id: "salt-building",
    exterior: "cafe-front",
    position: 7,
    bodyColor: "#2f6b5e",
    trimColor: "#f3e3c8",
    signText: "Salt City Letterpress",
  },
  room: {
    template: "studio",
    palette: STUDIO_WALL,
    gridWidth: 6,
    gridHeight: 5,
    props: [
      prop(
        "salt-shelf-1",
        "shelf-display",
        1,
        0,
        "#a9754f",
        content(
          "Wood and metal type cases",
          "Trays of hand-set wood and metal type, organised by face. Sample catalogue item.",
          link("salt-link-1", "See the type cases", "https://saltcityletterpress.example/type-cases"),
        ),
      ),
      prop(
        "salt-shelf-2",
        "shelf-display",
        4,
        0,
        "#a9754f",
        content(
          "Broadside, 'Low Tide Almanac'",
          "A letterpress broadside printed in two colours on cotton stock. Sample catalogue item.",
          link("salt-link-2", "View the broadside", "https://saltcityletterpress.example/shop/low-tide-almanac"),
        ),
      ),
      prop(
        "salt-desk",
        "booking-desk",
        2,
        3,
        "#6b5440",
        content(
          "Commission a print run",
          "Custom invitation or broadside runs, typically 50 to 200 pieces. Sample booking item.",
          link("salt-link-3", "Start a commission", "https://saltcityletterpress.example/commission/start"),
        ),
      ),
      prop(
        "salt-framed",
        "framed-work",
        0,
        0,
        "#2d2a26",
        content(
          "House type specimen sheet",
          "A specimen sheet of the shop's six most-used typefaces. Sample artwork for this demo.",
          link("salt-link-4", "See the specimen sheet", "https://saltcityletterpress.example/specimens"),
        ),
      ),
      prop("salt-rug", "rug", 3, 3, "#9c7b52"),
      prop("salt-plant", "plant", 5, 2, "#4d6b4a"),
      prop("salt-lamp", "lamp", 0, 2, "#caa968"),
    ],
  },
};

export const DEMO_TOWN: Town = {
  id: "sidewallk-demo-town",
  name: "Sidewallk Sample Street",
  members: [
    papermoth,
    lindenAndKiln,
    harborLightGoods,
    marrowCoffeeRoastery,
    thistleAndThread,
    needleAndGroove,
    birchAndVellum,
    saltCityLetterpress,
  ],
};
