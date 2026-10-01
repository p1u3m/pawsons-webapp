import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { houseBackground, type Character } from "@/lib/data";
import { cn } from "@/lib/utils";

// Shared pieces of the paper look used by /contents and /shop: cream cards
// on solid ledges, yellow sign buttons, round ink-blue buttons.

/** Yellow sign button on a gold ledge; rises on hover, sinks when pressed. */
export const signButton =
  "inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[26px] bg-sun px-[26px] text-[16px] font-bold whitespace-nowrap text-gold-ink [text-shadow:0_1px_0_rgb(255_255_255/0.35)] shadow-[0_4px_0_var(--color-gold),0_7px_0_#efe0b7] transition-[translate,box-shadow] duration-200 ease-spring not-disabled:hover:-translate-y-0.5 not-disabled:hover:shadow-[0_6px_0_var(--color-gold),0_9px_0_#efe0b7] not-disabled:active:translate-y-1 not-disabled:active:shadow-[0_0_0_var(--color-gold),0_2px_0_#efe0b7]";

/** Round cream button with an ink-blue icon (back, cart). */
export const roundButton =
  "grid size-[46px] shrink-0 place-items-center rounded-full bg-cream text-navy shadow-[0_4px_0_#ccc9c2] transition-transform duration-200 ease-spring hover:-translate-y-0.5";

/** Small house-coloured dot. */
export function Dot({ color, className }: { color?: string; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full bg-green", className)}
      style={color ? ({ background: color } as CSSProperties) : undefined}
      aria-hidden="true"
    />
  );
}

/** Card linking to a character's page: avatar, title and tagline. */
export function FriendLink({ character: c, title }: { character: Character; title: string }) {
  return (
    <Link
      className="group flex items-center gap-3.5 rounded-3xl bg-cream py-3 pr-[18px] pl-3 shadow-ledge-sm transition-transform duration-220 ease-spring hover:-translate-y-[3px]"
      href={`/characters/${c.type.toLowerCase()}`}
    >
      <span
        className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl"
        style={{ background: houseBackground(c.house) }}
      >
        <Image src={c.image} alt="" width={96} height={96} sizes="56px" className="h-auto w-[84%]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <strong>{title}</strong>
        <small className="truncate text-[13px] text-ink-muted">{c.tagline}</small>
      </span>
      <span
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        ↗
      </span>
    </Link>
  );
}

/** Page hero of /contents and /shop: copy beside art, stacked and centered on phones. */
export const pageHero =
  "wrap mb-11 grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center gap-12 max-split:grid-cols-1 max-split:gap-6 max-md:gap-2 max-md:text-center";
export const pageHeroTitle =
  "mb-4 text-[clamp(34px,4.4vw,54px)] leading-[1.18] tracking-[-0.02em] max-md:mb-3.5 max-md:text-[32px] max-md:leading-[1.3]";
export const pageHeroText =
  "max-w-[460px] text-[17px] leading-[1.75] max-md:mx-auto max-md:max-w-[320px] max-md:text-[15px] max-md:leading-[1.7]";

/**
 * Stand-in for a missing picture (product photo, post artwork): a picture
 * glyph (Material Symbols Rounded "image") with an optional label.
 */
export function ImagePlaceholder({ label }: { label?: string }) {
  const size = label ? 36 : 24;
  return (
    <span className="flex flex-col items-center gap-1.5 text-center text-[13px] text-ink-faint">
      <svg
        width={size}
        height={size}
        viewBox="0 -960 960 960"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0 0v-560 560Zm80-80h400q12 0 18-11t-2-21L586-459q-6-8-16-8t-16 8L450-320l-74-99q-6-8-16-8t-16 8l-80 107q-8 10-2 21t18 11Z" />
      </svg>
      {label}
    </span>
  );
}
