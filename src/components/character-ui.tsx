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

// Group order: the middle pair stands taller and in front, the outer two
// turn slightly outward. Sizes use container units so the group scales as one.
const groupPlacement = [
  "z-1 -rotate-7",
  "z-3 h-[50cqw] [animation-delay:-1.5s]",
  "z-2 h-[47cqw] [animation-delay:-3s]",
  "z-0 rotate-7 [animation-delay:-4.5s]",
];

/**
 * Friends standing together on a cream glow and a shared floor shadow, for
 * page heroes. Four friends form a group; a single friend stands larger.
 */
export function HeroFriends({ friends }: { friends: Character[] }) {
  const single = friends.length === 1;
  return (
    <div
      className="@container relative isolate flex aspect-[1.3] w-[min(80%,340px)] items-end justify-center justify-self-center pb-[9%] before:absolute before:bottom-[10%] before:left-1/2 before:-z-2 before:aspect-square before:w-[66%] before:-translate-x-1/2 before:rounded-full before:bg-[radial-gradient(circle_at_50%_45%,var(--color-cream)_0_58%,rgb(255_253_249/0)_71%)] before:content-[''] after:absolute after:bottom-[6%] after:left-1/2 after:-z-1 after:h-[9%] after:w-[86%] after:-translate-x-1/2 after:rounded-full after:bg-[radial-gradient(closest-side,rgb(24_24_24/0.12),rgb(24_24_24/0))] after:content-[''] split:w-[min(100%,480px)]"
      aria-hidden="true"
    >
      {friends.map((c, i) => (
        <Image
          key={c.type}
          src={c.image}
          alt=""
          width={480}
          height={480}
          sizes="(max-width: 860px) 45vw, 240px"
          priority
          className={cn(
            "relative h-[38cqw] w-auto flex-none origin-bottom animate-bob drop-shadow-[0_6px_10px_rgb(24_24_24/0.08)] motion-reduce:animate-none",
            single ? "h-[58cqw]" : cn("-mx-[7cqw]", groupPlacement[i]),
          )}
        />
      ))}
    </div>
  );
}

/** Two cards per row on phones, four from 768px. */
export const characterGrid = "grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5";

/** Character card on a solid ledge, for the /characters and /houses pages. */
export function CharacterTile({ character: c }: { character: Character }) {
  return (
    <Link
      className="group flex min-w-0 flex-col rounded-[22px] bg-cream p-1.5 shadow-ledge transition-transform duration-220 ease-spring hover:-translate-y-[5px] motion-reduce:transition-none md:rounded-[30px] md:p-2.5"
      href={`/characters/${c.type.toLowerCase()}`}
      style={{ "--house": c.house.badgeColor } as CSSProperties}
    >
      <span
        className="grid aspect-square place-items-center overflow-hidden rounded-[17px] md:rounded-[22px]"
        style={{ background: houseBackground(c.house) }}
      >
        <Image
          src={c.image}
          alt=""
          width={480}
          height={480}
          sizes="(max-width: 767px) 45vw, 260px"
          className="size-[82%] object-contain transition-transform duration-350 ease-spring group-hover:-translate-y-1 group-hover:scale-104 motion-reduce:transition-none"
        />
      </span>
      <span className="grid gap-1 px-1.5 pt-2.5 pb-1.5 md:px-2 md:pt-3.5 md:pb-2">
        <span className="flex items-center justify-between gap-2 text-[16px] font-bold md:text-[18px]">
          {c.name}
          <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--house)_12%,transparent)] px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-(--house)">
            {c.type}
          </span>
        </span>
        <span className="line-clamp-2 text-[12px] leading-[1.5] text-ink-muted md:text-[13px]">
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
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-cream pr-3 pl-4 text-[14px] font-semibold whitespace-nowrap shadow-ledge-sm transition-all duration-350 ease-spring hover:-translate-y-px motion-reduce:transition-none [&_svg]:text-ink-muted [&_svg]:transition-transform [&_svg]:duration-350 [&_svg]:ease-spring hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5 hover:[&_svg]:text-ink",
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
      {children && <p className="mt-3.5 text-[17px] leading-[1.75]">{children}</p>}
    </header>
  );
}

export function BackLink({
  href = "/characters",
  className,
  children = "กลับไปหาเพื่อน ๆ",
}: {
  href?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      className={cn(
        "mb-8 inline-flex items-center gap-2 rounded-full bg-ink/4 px-3.5 py-1.5 text-[13.5px] font-medium text-ink-muted transition-all duration-350 ease-spring hover:bg-ink/8 hover:text-ink",
        className,
      )}
      href={href}
    >
      <span aria-hidden="true">←</span>
      <span>{children}</span>
    </Link>
  );
}

/** Centered cream panel for 404, errors and other empty pages. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <section className="wrap mt-5 rounded-[28px] border border-line bg-cream py-20 text-center">
      {children}
    </section>
  );
}
