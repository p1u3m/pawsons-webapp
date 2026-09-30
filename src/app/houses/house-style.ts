import { houses } from "@/lib/data";

type House = (typeof houses)[number];

/** Band colour, doodle tile and accents of one house (see .chars-band). */
export function houseBandStyle(house: House) {
  return {
    "--pw-band": house.color,
    "--pattern": `url("/patterns/house-${house.id}.svg")`,
    "--house": house.badgeColor,
    "--house-ink": house.ink,
  } as React.CSSProperties;
}

export const crestSrc = (house: House) => `/houses/${house.sigil}`;
