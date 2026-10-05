import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "group/pill inline-flex items-center justify-center gap-3 whitespace-nowrap tiny:whitespace-normal";
// The wave-art sign has no box-shadow to grow (its ledge is a drop-shadow
// filter), so it just lifts a little and settles.
const lift = "hover:-translate-y-0.5 active:translate-y-0.5";

const sizes = {
  md: "min-h-12 px-[22px] py-2.5 text-body tiny:px-3.5 tiny:text-body-sm",
  sm: "min-h-12 px-[18px] py-2 text-body-sm",
};

const tones = {
  primary:
    "press border-ink/12 bg-ink text-cream [--ledge:var(--color-ledge-ink)] hover:bg-ink-soft",
  secondary:
    "press border-ink/10 bg-cream text-ink hover:border-ink/18 [&_[data-slot=disc]]:bg-ink/5 hover:[&_[data-slot=disc]]:bg-ink/8",
  /** Rainbow wash for "keep it in my room" actions. */
  gradient:
    "press border-ink/12 bg-[linear-gradient(90deg,#f7cac9,#dec2e6,#92a8d1,#a3d9c9,#f5df4d,#f7cac9)] text-ink [--ledge:var(--color-ledge-lilac)]",
};

/** Soft, slightly uneven yellow sign with a wave pattern (homepage invitation). */
const sign =
  "relative isolate min-h-[84px] w-[260px] bg-[url(/pawson-button-art.svg)] bg-size-[100%_100%] bg-center bg-no-repeat px-[38px] py-[15px] text-body-lg font-bold text-gold-ink [filter:drop-shadow(0_4px_0_var(--color-gold))_drop-shadow(0_4px_0_var(--color-ledge-sun))] [text-shadow:0_1px_0_rgb(255_255_255/0.35)] before:pointer-events-none before:absolute before:inset-0 before:bg-[url(/pawson-wave-tile.svg)] before:bg-size-[128px_128px] before:opacity-50 before:mask-[url(/pawson-button-art.svg)] before:mask-size-[100%_100%] before:mask-center before:mask-no-repeat before:content-[''] [&>*]:relative";

/** Cream pill standing on a solid ledge (footer). */
const ledge =
  "press-card min-h-14 gap-3.5 rounded-card bg-cream py-2.5 pr-[25px] pl-6 text-body-lg font-bold text-navy [&_[data-slot=disc]]:size-[31px] [&_[data-slot=disc]]:bg-navy [&_[data-slot=disc]]:text-body [&_[data-slot=disc]]:text-cream";

type PillOptions = {
  variant?: keyof typeof tones | "sign" | "ledge";
  size?: keyof typeof sizes;
};

/**
 * Pawsons pill button classes, for <Link>, <a> and <button> alike:
 *   <Link className={pillButton()} href="/quiz">Start <IconDisc>↗</IconDisc></Link>
 */
export function pillButton({
  variant = "primary",
  size = "md",
}: PillOptions = {}) {
  if (variant === "sign") return cn(base, lift, sign);
  if (variant === "ledge") return cn(base, ledge);
  return cn(
    base,
    "rounded-full border font-medium",
    sizes[size],
    tones[variant],
  );
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
        "-my-0.5 -mr-3 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/16 text-body-sm group-hover/pill:translate-x-0.5 group-hover/pill:-translate-y-0.5",
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
        "inline-flex items-center gap-1.5 rounded-full border border-ink/7 bg-ink/4 px-3 py-1 text-micro font-semibold tracking-[1.4px] text-ink-muted uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Inline text link; an aria-hidden arrow inside nudges on hover. */
export const textLink =
  "inline-flex items-center gap-1.5 py-1 text-body font-medium whitespace-nowrap text-ink hover:[&>[aria-hidden=true]]:translate-x-0.5 hover:[&>[aria-hidden=true]]:-translate-y-0.5";
