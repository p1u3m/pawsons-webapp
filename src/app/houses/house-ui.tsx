import Image from "next/image";
import type { ReactNode } from "react";
import { DoodleLabel } from "@/components/character-ui";
import { houseSigilSrc, type House } from "@/lib/data";
import { cn } from "@/lib/utils";

export const crestSrc = houseSigilSrc;

// A halo in the band colour clears the doodles behind text on a band.
export const bandHalo =
  "[text-shadow:0_0_2px_var(--band),0_0_8px_var(--band),0_0_18px_var(--band)]";

/** House crest on a paper blob (the blob is part of the crest). */
export function HouseCrest({
  house,
  priority,
  className,
}: {
  house: House;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      data-crest
      className={cn(
        "doodle-bg doodle-2 grid aspect-square place-items-center [--doodle-inset:-18%]",
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src={crestSrc(house)}
        alt=""
        width={320}
        height={320}
        priority={priority}
        className="h-[92%] w-auto drop-shadow-[0_10px_18px_rgb(24_24_24/0.08)]"
      />
    </div>
  );
}

/** Group, name, motto and description of a house; centered on phones, left-aligned from 768px. */
export function HouseIntro({
  house,
  title,
  heading: Heading,
  id,
  className,
  children,
}: {
  house: House;
  title: string;
  heading: "h1" | "h2";
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      data-copy
      className={cn(
        "flex max-w-[520px] flex-col items-center text-center md:items-start md:justify-self-stretch md:text-left",
        className,
      )}
    >
      <p className="mb-2 text-caption font-bold tracking-[0.14em] text-(--house)">
        {house.groupTitle}
      </p>
      <Heading
        id={id}
        className="flex flex-col gap-1 text-heading-lg leading-[1.15] tracking-[-0.02em] text-(--house-ink) md:text-[48px]"
      >
        {/* Shifted back by the label padding on desktop so the name lines up with the copy. */}
        <DoodleLabel className="self-center [overflow-wrap:normal] md:-left-[0.8em] md:self-start">
          {title}
        </DoodleLabel>
        <small className="text-body-lg font-semibold tracking-normal text-ink-soft">
          {house.thai}
        </small>
      </Heading>
      <p
        className="mt-4 text-body-lg font-semibold text-(--house-ink) italic"
        lang="en"
      >
        “{house.motto}”
      </p>
      <p className="mt-2 text-body leading-[1.75] text-ink-soft">
        {house.description}
      </p>
      {children}
    </div>
  );
}
