import { houses, houseSigilSrc, type House } from "@/lib/data";

/** One room per house: colours and the shape of the window / rug. */
export type RoomTheme = {
  id: House["id"];
  name: string;
  wall: string;
  floor: string;
  rug: string;
  rugRound: boolean;
  window: "arch" | "round" | "square";
  sigil: string;
  /** Page-side tint behind the canvas. */
  backdrop: string;
  house: House;
};

const looks: Record<
  House["id"],
  Pick<RoomTheme, "wall" | "floor" | "rug" | "rugRound" | "window">
> = {
  lavender: {
    wall: "#e7def2",
    floor: "#e2cbb1",
    rug: "#a58bd0",
    rugRound: true,
    window: "arch",
  },
  clover: {
    wall: "#dcecd6",
    floor: "#e4cfae",
    rug: "#7fb59b",
    rugRound: false,
    window: "round",
  },
  "forget-me-not": {
    wall: "#d9e7f6",
    floor: "#e4d0b2",
    rug: "#7ea3cc",
    rugRound: true,
    window: "square",
  },
  dandelion: {
    wall: "#f8ecc8",
    floor: "#e5cba4",
    rug: "#d9a872",
    rugRound: false,
    window: "arch",
  },
};

export const roomThemes: RoomTheme[] = houses.map((house) => ({
  id: house.id,
  name: house.name,
  sigil: houseSigilSrc(house),
  backdrop: house.gradientStart,
  house,
  ...looks[house.id],
}));

export function getRoomTheme(id: string | null | undefined): RoomTheme {
  return roomThemes.find((t) => t.id === id) ?? roomThemes[0];
}

/** Sky colours (top → bottom) for the window, by hour of day. */
export function skyColors(hour: number): [string, string] {
  if (hour >= 6 && hour < 8) return ["#ffc3a0", "#e0c3fc"];
  if (hour >= 8 && hour < 17) return ["#a1c4fd", "#c2e9fb"];
  if (hour >= 17 && hour < 20) return ["#f093fb", "#4facfe"];
  return ["#0f2027", "#2c5364"];
}
