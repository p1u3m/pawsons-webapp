import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "group/pill inline-flex items-center justify-center gap-3 whitespace-nowrap transition-all duration-350 ease-spring tiny:whitespace-normal";
// Hover lifts the pill a touch; press settles it.
const lift =
  "hover:-translate-y-px hover:scale-[1.015] active:translate-y-0 active:scale-[0.98]";
const raised =
  "shadow-[inset_0_1px_1px_rgb(255_255_255/0.22),0_4px_14px_-3px_rgb(24_24_24/0.14)] hover:shadow-[inset_0_1px_1px_rgb(255_255_255/0.25),0_6px_20px_-4px_rgb(24_24_24/0.18)]";

const sizes = {
  md: "min-h-12 px-[22px] py-2.5 text-[15px] tiny:px-3.5 tiny:text-[13.5px]",
  sm: "min-h-12 px-[18px] py-2 text-[14px]",
};

const tones = {
  primary: cn(raised, "border-ink/12 bg-ink text-cream hover:bg-[#282828]"),
  secondary:
    "border-ink/10 bg-cream/85 text-ink shadow-soft hover:border-ink/18 hover:bg-cream hover:shadow-card [&_[data-slot=disc]]:bg-ink/5 hover:[&_[data-slot=disc]]:bg-ink/8",
  /** Rainbow wash for "keep it in my room" actions. */
  gradient: cn(
    raised,
    "animate-gradient-flow border-ink/12 bg-[linear-gradient(90deg,#f7cac9,#dec2e6,#92a8d1,#a3d9c9,#f5df4d,#f7cac9)] bg-size-[200%_100%] text-ink",
  ),
};

/** Soft, slightly uneven yellow sign with a wave pattern (homepage invitation). */
const sign =
  "relative isolate min-h-[84px] w-[260px] bg-[url(/pawson-button-art.svg)] bg-size-[100%_100%] bg-center bg-no-repeat px-[38px] py-[15px] text-[17px] font-bold text-gold-ink [filter:drop-shadow(0_4px_0_#d6a027)_drop-shadow(0_4px_0_#efe0b7)] [text-shadow:0_1px_0_rgb(255_255_255/0.35)] before:pointer-events-none before:absolute before:inset-0 before:bg-[url(/pawson-wave-tile.svg)] before:bg-size-[128px_128px] before:opacity-50 before:mask-[url(/pawson-button-art.svg)] before:mask-size-[100%_100%] before:mask-center before:mask-no-repeat before:content-[''] [&>*]:relative";

/** Cream pill standing on a solid ledge (footer). */
const ledge =
  "min-h-14 gap-3.5 rounded-[28px] bg-cream py-2.5 pr-[25px] pl-6 text-[17px] font-bold text-navy shadow-[0_4px_0_#ccc9c2,0_8px_0_#e7dfcf] hover:-translate-y-0.5 active:translate-y-1 active:scale-[0.99] active:shadow-[0_1px_0_#ccc9c2,0_3px_0_#e7dfcf] [&_[data-slot=disc]]:size-[31px] [&_[data-slot=disc]]:bg-navy [&_[data-slot=disc]]:text-[15px] [&_[data-slot=disc]]:text-cream";

type PillOptions = {
  variant?: keyof typeof tones | "sign" | "ledge";
  size?: keyof typeof sizes;
};

/**
 * Pawsons pill button classes, for <Link>, <a> and <button> alike:
 *   <Link className={pillButton()} href="/quiz">Start <IconDisc>↗</IconDisc></Link>
 */
export function pillButton({ variant = "primary", size = "md" }: PillOptions = {}) {
  if (variant === "sign") return cn(base, lift, sign);
  if (variant === "ledge") return cn(base, ledge);
  return cn(base, lift, "rounded-full border font-medium", sizes[size], tones[variant]);
}

/**
 * Round icon chip at the end of a pill button; nudges up-right on hover.
 * Its negative margin tightens the pill's right padding around it.
 */
export function IconDisc({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      data-slot="disc"
      aria-hidden="true"
      className={cn(
        "-my-0.5 -mr-3 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/16 text-[14px] transition-transform duration-250 ease-spring group-hover/pill:translate-x-0.5 group-hover/pill:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Small uppercase label above a heading. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-ink/7 bg-ink/4 px-3 py-1 text-[11px] font-semibold tracking-[1.4px] text-ink-muted uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Inline text link; an aria-hidden arrow inside nudges on hover. */
export const textLink =
  "inline-flex items-center gap-1.5 py-1 text-[15px] font-medium whitespace-nowrap text-ink transition-opacity hover:opacity-72 [&>[aria-hidden=true]]:inline-block [&>[aria-hidden=true]]:text-[14px] [&>[aria-hidden=true]]:leading-none [&>[aria-hidden=true]]:transition-transform [&>[aria-hidden=true]]:duration-220 [&>[aria-hidden=true]]:ease-spring hover:[&>[aria-hidden=true]]:translate-x-0.5 hover:[&>[aria-hidden=true]]:-translate-y-0.5";
