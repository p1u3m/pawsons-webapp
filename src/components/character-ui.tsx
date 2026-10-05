import characterArt from "@/lib/character-art.json";
import { houseBackground, type House } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/lib/data";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./pill-button";

export function CharacterImage({
  character,
  priority = false,
  className = "",
}: {
  character: Character;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      className={className}
      src={character.image}
      alt={`${character.name} · ${character.type}`}
      width={480}
      height={480}
      sizes="(max-width: 640px) 45vw, 360px"
      priority={priority}
    />
  );
}

/** Colour, doodle tile and accents of one house, as CSS variables for HouseBand and friends. */
export function houseVars(house: House) {
  return {
    "--band": house.color,
    "--pattern": `url("/patterns/house-${house.id}.svg")`,
    "--house": house.badgeColor,
    "--house-ink": house.ink,
  } as CSSProperties;
}

/**
 * Wavy doodle band in a house colour (houseVars). Its wave laps over the
 * bottom of the band above, so stacked bands rise like hills.
 */
export function HouseBand({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      data-band
      className={cn(
        "band band-wave-top band-pattern mt-[calc(var(--wave)+32px)] pt-7 pb-[calc(var(--wave)+40px)] [--wave:64px] last:pb-[120px] md:[--wave:120px] [[data-band]+&]:mt-0",
        className,
      )}
      {...props}
    />
  );
}

export { HeroFriends } from "./hero-friends";

/** Two cards per row on phones, four from 768px. */
export const characterGrid = "grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5";

/** Character card on a solid ledge, for the /characters and /houses pages. */
export function CharacterTile({ character: c }: { character: Character }) {
  const art = characterArt[c.type];
  return (
    <Link
      className="group flex min-w-0 flex-col rounded-card-sm bg-cream p-1.5 press-card md:p-2.5"
      href={`/characters/${c.type.toLowerCase()}`}
      style={{ "--house": c.house.badgeColor } as CSSProperties}
    >
      <span
        className="relative grid aspect-square place-items-center overflow-hidden rounded-tile"
        style={{ background: houseBackground(c.house) }}
      >
        <span className="absolute inset-0 flex items-center justify-center">
          <Image
            src={c.image}
            alt=""
            width={art.width}
            height={art.height}
            sizes="(max-width: 767px) 45vw, 260px"
            className={cn(
              "w-auto object-contain group-hover:-translate-y-1 group-hover:scale-104",
              c.type === "INTP" ? "h-[65%] max-w-[81%]" : "h-[72%] max-w-[90%]",
            )}
          />
        </span>
      </span>
      <span className="grid gap-1 px-1.5 pt-2.5 pb-1.5 md:px-2 md:pt-3.5 md:pb-2">
        <span className="flex items-center justify-between gap-2 text-body-lg font-bold md:text-lead">
          {c.name}
          <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--house)_12%,transparent)] px-2 py-0.5 text-micro font-bold tracking-[0.04em] text-(--house)">
            {c.type}
          </span>
        </span>
        <span className="line-clamp-2 text-small leading-[1.6] text-ink-muted">
          {c.tagline}
        </span>
      </span>
    </Link>
  );
}

/** Small cream chip link on a ledge, with an arrow icon that nudges on hover. */
export function ChipLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-cream pr-3 pl-4 text-body-sm font-semibold whitespace-nowrap press-card [--depth:3px] [&_svg]:text-ink-muted hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 hover:[&_svg]:text-ink",
        className,
      )}
      {...props}
    />
  );
}

/** Section title on a soft paper blob. */
export function DoodleLabel({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "doodle-bg doodle-2 inline-flex max-w-full items-center gap-2.5 px-[0.8em] py-[0.3em] leading-[1.35] font-bold tracking-normal [overflow-wrap:anywhere] text-ink [--doodle-inset:-36px_-64px] [text-shadow:none]",
        className,
      )}
      {...props}
    />
  );
}

export function PageIntro({
  label,
  title,
  className,
  children,
}: {
  label: string;
  title: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={cn("mb-11 max-w-[780px]", className)}>
      <Eyebrow className="mb-4">{label}</Eyebrow>
      <h1 className="text-[clamp(32px,3.8vw,46px)] leading-[1.25]">{title}</h1>
      {children && (
        <p className="mt-3.5 text-body-lg leading-[1.75]">{children}</p>
      )}
    </header>
  );
}

/** Centered cream panel for 404, errors and other empty pages. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <section className="wrap mt-5 rounded-card border border-line bg-cream py-20 text-center">
      {children}
    </section>
  );
}
